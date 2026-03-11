"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAuthToken } from "@/features/services/api";
import { mockBids, mockContracts, mockDisputes, mockMessages, mockNotifications, mockProjects, mockReviews, mockUsers } from "@/mock-data";
import { Bid, Contract, Dispute, Message, Notification, Project, Review, User, UserRole } from "@/types";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
};

type NewProjectPayload = {
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  attachments: string[];
  location: string;
};

type PlaceBidPayload = {
  projectId: string;
  sellerId: string;
  price: number;
  deliveryDays: number;
  proposal: string;
};

type SettingsPayload = {
  name?: string;
  phone?: string;
  companyName?: string;
};

type BidWiseState = {
  users: User[];
  projects: Project[];
  bids: Bid[];
  notifications: Notification[];
  messages: Message[];
  contracts: Contract[];
  reviews: Review[];
  disputes: Dispute[];
  currentUser: User | null;
  authToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<boolean>;
  syncForCurrentUser: () => Promise<void>;
  createProject: (payload: NewProjectPayload) => Promise<void>;
  placeBid: (payload: PlaceBidPayload) => Promise<void>;
  acceptBid: (bidId: string) => Promise<void>;
  rejectBid: (bidId: string) => Promise<void>;
  sendMessage: (toUserId: string, content: string, attachment?: string) => Promise<void>;
  refreshConversation: (peerId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  verifyVendor: (id: string) => Promise<void>;
  resolveDispute: (id: string) => Promise<void>;
  updateSettings: (payload: SettingsPayload) => void;
  addReview: (toUserId: string, rating: number, comment: string) => Promise<void>;
};

const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
};

export const useBidWiseStore = create<BidWiseState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      projects: mockProjects,
      bids: mockBids,
      notifications: mockNotifications,
      messages: mockMessages,
      contracts: mockContracts,
      reviews: mockReviews,
      disputes: mockDisputes,
      currentUser: null,
      authToken: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const auth = await api.login(email, password);
          setAuthToken(auth.token);
          set({ currentUser: auth.user, authToken: auth.token });
          await get().syncForCurrentUser();
          set({ loading: false });
          return true;
        } catch {
          set({ currentUser: null, authToken: null, loading: false });
          return false;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({ currentUser: null, authToken: null });
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const auth = await api.register(payload);
          setAuthToken(auth.token);
          set((state) => ({
            users: uniqueById([auth.user, ...state.users]),
            currentUser: auth.user,
            authToken: auth.token,
            loading: false
          }));
          await get().syncForCurrentUser();
          return true;
        } catch {
          set({ loading: false });
          return false;
        }
      },

      syncForCurrentUser: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        set({ loading: true });
        try {
          const users = await api.getUsers();
          const safeUsers = users.length ? users : get().users;

          const resolvedCurrentUser = safeUsers.find(
            (item) => item.email.toLowerCase() === currentUser.email.toLowerCase()
          ) ?? currentUser;

          let projects: Project[] = [];
          let bids: Bid[] = [];
          let disputes: Dispute[] = get().disputes;

          if (resolvedCurrentUser.role === "buyer") {
            projects = await api.getBuyerProjects(resolvedCurrentUser.id);
            const bidsByProject = await Promise.all(projects.map((project) => api.getProjectBids(project.id)));
            bids = uniqueById(bidsByProject.flat());
          }

          if (resolvedCurrentUser.role === "seller") {
            const openProjects = await api.getSellerProjects();
            const myBids = await api.getSellerBids(resolvedCurrentUser.id);
            projects = openProjects;
            bids = myBids;
          }

          if (resolvedCurrentUser.role === "admin") {
            projects = await api.getAllProjects();
            const bidsByProject = await Promise.all(projects.map((project) => api.getProjectBids(project.id)));
            bids = uniqueById(bidsByProject.flat());
            disputes = await api.getDisputes();
          }

          const notifications = await api.getNotifications(resolvedCurrentUser.id);
          const reviews = await api.getReviewsForUser(resolvedCurrentUser.id);

          set((state) => ({
            users: uniqueById([...safeUsers, ...state.users]),
            currentUser: resolvedCurrentUser,
            projects,
            bids,
            notifications,
            reviews: uniqueById([...reviews, ...state.reviews]),
            disputes,
            loading: false
          }));
        } catch {
          set({ loading: false });
        }
      },

      createProject: async (payload) => {
        const currentUser = get().currentUser;
        if (!currentUser) {
          throw new Error("Please login to create a project.");
        }

        if (currentUser.role !== "buyer") {
          throw new Error("Only buyer accounts can create projects.");
        }

        set({ loading: true });
        try {
          const project = await api.createProject(payload);
          set((state) => ({ projects: [project, ...state.projects], loading: false }));
          await get().syncForCurrentUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      placeBid: async (payload) => {
        set({ loading: true });
        try {
          const bid = await api.placeBid(payload);
          set((state) => ({ bids: uniqueById([bid, ...state.bids]), loading: false }));
          await get().syncForCurrentUser();
        } catch {
          set({ loading: false });
        }
      },

      acceptBid: async (bidId) => {
        const bid = get().bids.find((item) => item.id === bidId);
        if (!bid) return;

        set({ loading: true });
        try {
          const contract = await api.acceptBid(bid.projectId, bidId);
          set((state) => ({
            bids: state.bids.map((item) =>
              item.projectId === bid.projectId
                ? { ...item, status: item.id === bidId ? "accepted" : "rejected" }
                : item
            ),
            projects: state.projects.map((item) =>
              item.id === bid.projectId ? { ...item, status: "in_progress" } : item
            ),
            contracts: uniqueById([contract, ...state.contracts]),
            loading: false
          }));
          await get().syncForCurrentUser();
        } catch {
          set({ loading: false });
        }
      },

      rejectBid: async (bidId) => {
        const bid = get().bids.find((item) => item.id === bidId);
        if (!bid) return;

        try {
          const updated = await api.rejectBid(bid.projectId, bidId);
          set((state) => ({
            bids: state.bids.map((item) => (item.id === bidId ? updated : item))
          }));
        } catch {
          set((state) => ({
            bids: state.bids.map((item) => (item.id === bidId ? { ...item, status: "rejected" } : item))
          }));
        }
      },

      sendMessage: async (toUserId, content, attachment) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
          const message = await api.sendMessage({
            fromUserId: currentUser.id,
            toUserId,
            content,
            attachment
          });
          set((state) => ({ messages: uniqueById([...state.messages, message]) }));
          await get().syncForCurrentUser();
        } catch {
          const fallback: Message = {
            id: `local-msg-${Date.now()}`,
            fromUserId: currentUser.id,
            toUserId,
            content,
            attachment,
            createdAt: new Date().toISOString()
          };
          set((state) => ({ messages: [...state.messages, fallback] }));
        }
      },

      refreshConversation: async (peerId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        try {
          const conversation = await api.getConversation(currentUser.id, peerId);
          set((state) => ({ messages: uniqueById([...state.messages, ...conversation]) }));
        } catch {
          // no-op fallback
        }
      },

      markNotificationRead: async (id) => {
        try {
          const updated = await api.markNotificationRead(id);
          set((state) => ({
            notifications: state.notifications.map((item) => (item.id === id ? updated : item))
          }));
        } catch {
          set((state) => ({
            notifications: state.notifications.map((item) =>
              item.id === id ? { ...item, isRead: true } : item
            )
          }));
        }
      },

      blockUser: async (id) => {
        try {
          const updated = await api.blockUser(id);
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? updated : item))
          }));
        } catch {
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? { ...item, blocked: true } : item))
          }));
        }
      },

      verifyVendor: async (id) => {
        try {
          const updated = await api.verifyVendor(id);
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? updated : item))
          }));
        } catch {
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? { ...item, verified: true } : item))
          }));
        }
      },

      resolveDispute: async (id) => {
        try {
          const updated = await api.resolveDispute(id);
          set((state) => ({
            disputes: state.disputes.map((item) => (item.id === id ? updated : item))
          }));
        } catch {
          set((state) => ({
            disputes: state.disputes.map((item) =>
              item.id === id ? { ...item, status: "resolved" } : item
            )
          }));
        }
      },

      updateSettings: (payload) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        const updated = { ...currentUser, ...payload };
        set((state) => ({
          currentUser: updated,
          users: state.users.map((item) => (item.id === currentUser.id ? updated : item))
        }));
      },

      addReview: async (toUserId, rating, comment) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        try {
          const review = await api.addReview({
            fromUserId: currentUser.id,
            toUserId,
            rating,
            comment
          });
          set((state) => ({ reviews: [review, ...state.reviews] }));
        } catch {
          const fallback: Review = {
            id: `local-review-${Date.now()}`,
            fromUserId: currentUser.id,
            toUserId,
            rating,
            comment,
            createdAt: new Date().toISOString().slice(0, 10)
          };
          set((state) => ({ reviews: [fallback, ...state.reviews] }));
        }
      }
    }),
    {
      name: "bidwise-store",
      partialize: (state) => ({ currentUser: state.currentUser, authToken: state.authToken }),
      onRehydrateStorage: () => (state) => {
        const token = state?.authToken ?? null;
        setAuthToken(token);
        if (!token && state?.currentUser) {
          state.currentUser = null;
        }
      }
    }
  )
);








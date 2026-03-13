"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAuthToken } from "@/features/services/api";
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
  completeProject: (projectId: string) => Promise<void>;
  sendMessage: (toUserId: string, content: string, attachment?: string) => Promise<void>;
  refreshConversation: (peerId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  blockUser: (id: string) => Promise<void>;
  verifyVendor: (id: string) => Promise<void>;
  resolveDispute: (id: string) => Promise<void>;
  updateSettings: (payload: SettingsPayload) => Promise<void>;
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
      users: [],
      projects: [],
      bids: [],
      notifications: [],
      messages: [],
      contracts: [],
      reviews: [],
      disputes: [],
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
          let disputes: Dispute[] = [];

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
          const contracts = await api.getContractsForUser(resolvedCurrentUser.id);

          set((state) => ({
            users: uniqueById([...safeUsers, ...state.users]),
            currentUser: resolvedCurrentUser,
            projects,
            bids,
            notifications,
            reviews: uniqueById([...reviews, ...state.reviews]),
            contracts,
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
          await api.createProject(payload);
          await get().syncForCurrentUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      placeBid: async (payload) => {
        set({ loading: true });
        try {
          await api.placeBid(payload);
          await get().syncForCurrentUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      acceptBid: async (bidId) => {
        const bid = get().bids.find((item) => item.id === bidId);
        if (!bid) return;

        set({ loading: true });
        try {
          await api.acceptBid(bid.projectId, bidId);
          await get().syncForCurrentUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      rejectBid: async (bidId) => {
        const bid = get().bids.find((item) => item.id === bidId);
        if (!bid) return;

        try {
          await api.rejectBid(bid.projectId, bidId);
          await get().syncForCurrentUser();
        } catch (error) {
          throw error;
        }
      },

      completeProject: async (projectId) => {
        set({ loading: true });
        try {
          await api.completeProject(projectId);
          await get().syncForCurrentUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      sendMessage: async (toUserId, content, attachment) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        try {
          await api.sendMessage({
            fromUserId: currentUser.id,
            toUserId,
            content,
            attachment
          });
          await get().syncForCurrentUser();
        } catch (error) {
          throw error;
        }
      },

      refreshConversation: async (peerId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        try {
          const conversation = await api.getConversation(currentUser.id, peerId);
          set((state) => ({ messages: uniqueById([...state.messages, ...conversation]) }));
        } catch (error) {
          throw error;
        }
      },

      markNotificationRead: async (id) => {
        try {
          const updated = await api.markNotificationRead(id);
          set((state) => ({
            notifications: state.notifications.map((item) => (item.id === id ? updated : item))
          }));
        } catch (error) {
          throw error;
        }
      },

      blockUser: async (id) => {
        try {
          const updated = await api.blockUser(id);
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? updated : item))
          }));
        } catch (error) {
          throw error;
        }
      },

      verifyVendor: async (id) => {
        try {
          const updated = await api.verifyVendor(id);
          set((state) => ({
            users: state.users.map((item) => (item.id === id ? updated : item))
          }));
        } catch (error) {
          throw error;
        }
      },

      resolveDispute: async (id) => {
        try {
          const updated = await api.resolveDispute(id);
          set((state) => ({
            disputes: state.disputes.map((item) => (item.id === id ? updated : item))
          }));
        } catch (error) {
          throw error;
        }
      },

      updateSettings: async (payload) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        const updated = await api.updateUser(currentUser.id, payload);
        set((state) => ({
          currentUser: updated,
          users: state.users.map((item) => (item.id === currentUser.id ? updated : item))
        }));
      },

      addReview: async (toUserId, rating, comment) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        try {
          await api.addReview({
            fromUserId: currentUser.id,
            toUserId,
            rating,
            comment
          });
          await get().syncForCurrentUser();
        } catch (error) {
          throw error;
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





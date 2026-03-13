import { Bid, Contract, Dispute, Message, Notification, Project, Review, User, UserRole } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type ApiPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  phone?: string;
  companyName?: string;
  blocked: boolean;
  verified: boolean;
  rating?: number;
  skills?: string[];
};

type ApiProject = {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  location?: string;
  attachments?: string[];
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "FLAGGED";
  bidsCount: number;
  createdAt: string;
  updatedAt: string;
};

type ApiBid = {
  id: string;
  projectId: string;
  sellerId: string;
  price: number;
  deliveryDays: number;
  proposal: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
};

type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BID" | "MESSAGE" | "PROJECT" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
};

type ApiMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  attachment?: string;
  createdAt: string;
};

type ApiReview = {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ApiDispute = {
  id: string;
  projectId: string;
  raisedBy: string;
  against: string;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  createdAt: string;
};

type ApiContract = {
  id: string;
  bidId: string;
  projectId: string;
  buyerId: string;
  sellerId: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  progress: number;
};

type ApiAuthResponse = {
  token: string;
  user: ApiUser;
};

const toRole = (role: ApiUser["role"]): UserRole => role.toLowerCase() as UserRole;
const toProjectStatus = (status: ApiProject["status"]): Project["status"] => {
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "COMPLETED") return "completed";
  return "open";
};
const toBidStatus = (status: ApiBid["status"]): Bid["status"] => status.toLowerCase() as Bid["status"];
const toNotificationType = (type: ApiNotification["type"]): Notification["type"] => type.toLowerCase() as Notification["type"];

const mapUser = (u: ApiUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: toRole(u.role),
  phone: u.phone,
  companyName: u.companyName,
  blocked: u.blocked,
  verified: u.verified,
  rating: u.rating,
  skills: u.skills
});

const mapProject = (p: ApiProject): Project => ({
  id: p.id,
  buyerId: p.buyerId,
  title: p.title,
  description: p.description,
  budget: p.budget,
  category: p.category,
  deadline: p.deadline,
  location: p.location ?? "Remote",
  attachments: p.attachments ?? [],
  status: toProjectStatus(p.status),
  createdAt: p.createdAt,
  flagged: p.status === "FLAGGED"
});

const mapBid = (b: ApiBid): Bid => ({
  id: b.id,
  projectId: b.projectId,
  sellerId: b.sellerId,
  price: b.price,
  deliveryDays: b.deliveryDays,
  proposal: b.proposal,
  status: toBidStatus(b.status),
  createdAt: b.createdAt
});

const mapNotification = (n: ApiNotification): Notification => ({
  id: n.id,
  userId: n.userId,
  title: n.title,
  message: n.message,
  type: toNotificationType(n.type),
  isRead: n.isRead,
  createdAt: n.createdAt
});

const mapMessage = (m: ApiMessage): Message => ({
  id: m.id,
  fromUserId: m.fromUserId,
  toUserId: m.toUserId,
  content: m.content,
  attachment: m.attachment,
  createdAt: m.createdAt
});

const mapReview = (r: ApiReview): Review => ({
  id: r.id,
  fromUserId: r.fromUserId,
  toUserId: r.toUserId,
  rating: r.rating,
  comment: r.comment,
  createdAt: r.createdAt
});

const mapDispute = (d: ApiDispute): Dispute => ({
  id: d.id,
  projectId: d.projectId,
  raisedBy: d.raisedBy,
  against: d.against,
  reason: d.reason,
  status: d.status === "RESOLVED" ? "resolved" : "open"
});

const mapContract = (c: ApiContract): Contract => ({
  id: c.id,
  bidId: c.bidId,
  projectId: c.projectId,
  buyerId: c.buyerId,
  sellerId: c.sellerId,
  paymentStatus: c.paymentStatus === "PAID" ? "paid" : "pending",
  progress: c.progress,
  timeline: ["Bid accepted", "Contract generated"]
});

const buildUrl = (path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

async function request<T>(path: string, init?: RequestInit, params?: Record<string, string | number | undefined>): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined)
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...init,
      headers,
      cache: "no-store"
    });
  } catch {
    throw new Error(`Unable to reach backend API (${API_BASE}). Check backend server and CORS settings.`);
  }

  if (!response.ok) {
    const text = await response.text();
    if (!text) {
      throw new Error(`Request failed with ${response.status}`);
    }

    let message = text;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      message = parsed.message || parsed.error || text;
    } catch {
      // Keep plain-text fallback from the backend.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await request<ApiAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    return { token: res.token, user: mapUser(res.user) };
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    skills?: string[];
  }): Promise<{ token: string; user: User }> => {
    const body = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role.toUpperCase(),
      phone: payload.phone,
      companyName: payload.companyName,
      skills: payload.skills ?? []
    };

    const res = await request<ApiAuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    });

    return { token: res.token, user: mapUser(res.user) };
  },

  getUsers: async (): Promise<User[]> => {
    const page = await request<ApiPage<ApiUser>>("/users", undefined, { page: 0, size: 500 });
    return page.content.map(mapUser);
  },

  getBuyerProjects: async (buyerId: string): Promise<Project[]> => {
    const page = await request<ApiPage<ApiProject>>("/buyer/projects", undefined, { buyerId, page: 0, size: 200 });
    return page.content.map(mapProject);
  },

  getSellerProjects: async (): Promise<Project[]> => {
    const page = await request<ApiPage<ApiProject>>("/seller/projects", undefined, { status: "OPEN", page: 0, size: 200 });
    return page.content.map(mapProject);
  },

  getAllProjects: async (): Promise<Project[]> => {
    const page = await request<ApiPage<ApiProject>>("/buyer/projects", undefined, { page: 0, size: 500 });
    return page.content.map(mapProject);
  },

  createProject: async (payload: {
    title: string;
    description: string;
    budget: number;
    category: string;
    deadline: string;
    attachments: string[];
    location: string;
  }): Promise<Project> => {
    const project = await request<ApiProject>("/buyer/projects", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return mapProject(project);
  },

  getProjectBids: async (projectId: string): Promise<Bid[]> => {
    const bids = await request<ApiBid[]>(`/buyer/projects/${projectId}/bids`);
    return bids.map(mapBid);
  },

  placeBid: async (payload: {
    projectId: string;
    sellerId: string;
    price: number;
    deliveryDays: number;
    proposal: string;
  }): Promise<Bid> => {
    const bid = await request<ApiBid>("/seller/bids", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return mapBid(bid);
  },

  getSellerBids: async (sellerId: string): Promise<Bid[]> => {
    const page = await request<ApiPage<ApiBid>>("/seller/bids", undefined, { sellerId, page: 0, size: 300 });
    return page.content.map(mapBid);
  },

  acceptBid: async (projectId: string, bidId: string): Promise<Contract> => {
    const contract = await request<ApiContract>(`/buyer/projects/${projectId}/bids/${bidId}/accept`, { method: "PATCH" });
    return mapContract(contract);
  },

  rejectBid: async (projectId: string, bidId: string): Promise<Bid> => {
    const bid = await request<ApiBid>(`/buyer/projects/${projectId}/bids/${bidId}/reject`, { method: "PATCH" });
    return mapBid(bid);
  },

  completeProject: async (projectId: string): Promise<Project> => {
    const project = await request<ApiProject>(`/buyer/projects/${projectId}/complete`, { method: "PATCH" });
    return mapProject(project);
  },

  getNotifications: async (userId: string): Promise<Notification[]> => {
    const page = await request<ApiPage<ApiNotification>>("/notifications", undefined, { userId, page: 0, size: 300 });
    return page.content.map(mapNotification);
  },

  markNotificationRead: async (id: string): Promise<Notification> => {
    const notification = await request<ApiNotification>(`/notifications/${id}/read`, { method: "PATCH" });
    return mapNotification(notification);
  },

  sendMessage: async (payload: {
    fromUserId: string;
    toUserId: string;
    content: string;
    attachment?: string;
  }): Promise<Message> => {
    const message = await request<ApiMessage>("/messages", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return mapMessage(message);
  },

  getConversation: async (userA: string, userB: string): Promise<Message[]> => {
    const messages = await request<ApiMessage[]>("/messages", undefined, { userA, userB });
    return messages.map(mapMessage);
  },

  addReview: async (payload: { fromUserId: string; toUserId: string; rating: number; comment: string }): Promise<Review> => {
    const review = await request<ApiReview>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return mapReview(review);
  },

  getReviewsForUser: async (toUserId: string): Promise<Review[]> => {
    const page = await request<ApiPage<ApiReview>>("/reviews", undefined, { toUserId, page: 0, size: 200 });
    return page.content.map(mapReview);
  },

  getContractsForUser: async (userId: string): Promise<Contract[]> => {
    const page = await request<ApiPage<ApiContract>>("/contracts", undefined, { userId, page: 0, size: 200 });
    return page.content.map(mapContract);
  },

  getContract: async (id: string): Promise<Contract> => {
    const contract = await request<ApiContract>(`/contracts/${id}`);
    return mapContract(contract);
  },
  createDispute: async (payload: { projectId: string; raisedBy: string; against: string; reason: string }): Promise<Dispute> => {
    const dispute = await request<ApiDispute>("/disputes", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return mapDispute(dispute);
  },

  getDisputes: async (): Promise<Dispute[]> => {
    const page = await request<ApiPage<ApiDispute>>("/admin/disputes", undefined, { page: 0, size: 200 });
    return page.content.map(mapDispute);
  },

  resolveDispute: async (id: string): Promise<Dispute> => {
    const dispute = await request<ApiDispute>(`/admin/disputes/${id}/resolve`, { method: "PATCH" });
    return mapDispute(dispute);
  },

  updateUser: async (id: string, payload: { name?: string; phone?: string; companyName?: string }): Promise<User> => {
    const user = await request<ApiUser>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    return mapUser(user);
  },
  blockUser: async (id: string): Promise<User> => {
    const user = await request<ApiUser>(`/admin/users/${id}/block`, { method: "PATCH" });
    return mapUser(user);
  },

  verifyVendor: async (id: string): Promise<User> => {
    const user = await request<ApiUser>(`/admin/users/${id}/verify`, { method: "PATCH" });
    return mapUser(user);
  }
};









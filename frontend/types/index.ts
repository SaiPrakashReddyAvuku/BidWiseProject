export type UserRole = "buyer" | "seller" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
  blocked?: boolean;
  verified?: boolean;
  skills?: string[];
  rating?: number;
};

export type Project = {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  deadline: string;
  location: string;
  attachments: string[];
  status: "open" | "in_progress" | "completed";
  createdAt: string;
  flagged?: boolean;
};

export type Bid = {
  id: string;
  projectId: string;
  sellerId: string;
  price: number;
  deliveryDays: number;
  proposal: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "bid" | "message" | "project" | "system";
  isRead: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  attachment?: string;
  createdAt: string;
};

export type Contract = {
  id: string;
  projectId: string;
  bidId: string;
  buyerId: string;
  sellerId: string;
  paymentStatus: "pending" | "paid";
  progress: number;
  timeline: string[];
};

export type Review = {
  id: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Dispute = {
  id: string;
  projectId: string;
  raisedBy: string;
  against: string;
  reason: string;
  status: "open" | "resolved";
};


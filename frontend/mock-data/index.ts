import { Bid, Contract, Dispute, Message, Notification, Project, Review, User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "buyer-1",
    name: "Olivia Carter",
    email: "buyer@bidwise.com",
    role: "buyer",
    companyName: "NorthPeak Retail",
    phone: "+1-555-0100",
    rating: 4.7
  },
  {
    id: "buyer-2",
    name: "Noah Reed",
    email: "buyer2@bidwise.com",
    role: "buyer",
    companyName: "Brightline Health",
    rating: 4.5
  },
  {
    id: "seller-1",
    name: "Vendor A",
    email: "seller@bidwise.com",
    role: "seller",
    companyName: "Ava Digital Studio",
    verified: true,
    skills: ["React", "UX Design", "API Integration"],
    rating: 4.9
  },
  {
    id: "seller-2",
    name: "Vendor B",
    email: "seller2@bidwise.com",
    role: "seller",
    companyName: "Liam Systems",
    verified: true,
    skills: ["Node.js", "Next.js", "Cloud"],
    rating: 4.6
  },
  {
    id: "seller-3",
    name: "Vendor C",
    email: "seller3@bidwise.com",
    role: "seller",
    companyName: "Nova Product Labs",
    verified: true,
    skills: ["Product Strategy", "Frontend Engineering", "QA"],
    rating: 4.8
  },
  {
    id: "admin-1",
    name: "Admin Team",
    email: "admin@bidwise.com",
    role: "admin",
    verified: true
  }
];

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    buyerId: "buyer-1",
    title: "E-commerce Checkout Optimization",
    description: "Improve checkout flow and reduce cart abandonment for our web storefront.",
    budget: 12000,
    category: "Web Development",
    deadline: "2026-04-20",
    location: "Remote",
    attachments: ["checkout-spec.pdf", "analytics-export.csv"],
    status: "open",
    createdAt: "2026-03-01"
  },
  {
    id: "proj-2",
    buyerId: "buyer-1",
    title: "Customer Support AI Chatbot",
    description: "Deploy chatbot for tier-1 support with CRM integration.",
    budget: 18000,
    category: "AI Solutions",
    deadline: "2026-05-05",
    location: "New York",
    attachments: ["requirements.docx"],
    status: "in_progress",
    createdAt: "2026-02-20"
  },
  {
    id: "proj-3",
    buyerId: "buyer-2",
    title: "Mobile App UI Refresh",
    description: "Redesign onboarding and dashboard screens with accessibility focus.",
    budget: 9000,
    category: "Design",
    deadline: "2026-03-30",
    location: "Remote",
    attachments: ["brand-guidelines.pdf"],
    status: "open",
    createdAt: "2026-03-02",
    flagged: true
  }
];

export const mockBids: Bid[] = [
  {
    id: "bid-1",
    projectId: "proj-1",
    sellerId: "seller-1",
    price: 9000,
    deliveryDays: 21,
    proposal: "We will rebuild checkout components and optimize funnel analytics.",
    status: "pending",
    createdAt: "2026-03-03"
  },
  {
    id: "bid-2",
    projectId: "proj-1",
    sellerId: "seller-2",
    price: 8500,
    deliveryDays: 19,
    proposal: "Fast delivery with A/B testing support and payment gateway hardening.",
    status: "pending",
    createdAt: "2026-03-04"
  },
  {
    id: "bid-5",
    projectId: "proj-1",
    sellerId: "seller-3",
    price: 8000,
    deliveryDays: 16,
    proposal: "Lean execution plan focused on conversion metrics and rollout quality.",
    status: "pending",
    createdAt: "2026-03-05"
  },
  {
    id: "bid-3",
    projectId: "proj-2",
    sellerId: "seller-1",
    price: 15500,
    deliveryDays: 30,
    proposal: "Conversational AI with escalation routing and dashboard reports.",
    status: "accepted",
    createdAt: "2026-02-22"
  },
  {
    id: "bid-4",
    projectId: "proj-3",
    sellerId: "seller-2",
    price: 8100,
    deliveryDays: 14,
    proposal: "Design system pass and prototype updates in Figma.",
    status: "pending",
    createdAt: "2026-03-04"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "buyer-1",
    title: "New bid received",
    message: "Vendor A submitted a new bid for E-commerce Checkout Optimization.",
    type: "bid",
    isRead: false,
    createdAt: "2026-03-04"
  },
  {
    id: "notif-2",
    userId: "seller-1",
    title: "Bid accepted",
    message: "Your bid for Customer Support AI Chatbot was accepted.",
    type: "project",
    isRead: false,
    createdAt: "2026-02-23"
  }
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    fromUserId: "buyer-1",
    toUserId: "seller-1",
    content: "Can you share your rollout plan?",
    createdAt: "2026-03-04T08:00:00.000Z"
  },
  {
    id: "msg-2",
    fromUserId: "seller-1",
    toUserId: "buyer-1",
    content: "Yes, sending a phased timeline by tonight.",
    createdAt: "2026-03-04T08:15:00.000Z"
  }
];

export const mockContracts: Contract[] = [
  {
    id: "contract-1",
    projectId: "proj-2",
    bidId: "bid-3",
    buyerId: "buyer-1",
    sellerId: "seller-1",
    paymentStatus: "pending",
    progress: 45,
    timeline: ["Scope approved", "Kickoff completed", "Phase 1 in progress"]
  }
];

export const mockReviews: Review[] = [
  {
    id: "review-1",
    fromUserId: "buyer-1",
    toUserId: "seller-1",
    rating: 5,
    comment: "Clear communication and proactive updates.",
    createdAt: "2026-02-28"
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: "dispute-1",
    projectId: "proj-3",
    raisedBy: "buyer-2",
    against: "seller-2",
    reason: "Scope misunderstanding on design revisions.",
    status: "open"
  }
];

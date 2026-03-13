import { Bid, Project, User } from "@/types";

export type TimeRemaining = {
  totalMs: number;
  isClosed: boolean;
  days: number;
  hours: number;
  minutes: number;
  label: string;
};

export type SellerRecommendation = {
  seller: User;
  score: number;
  location: string;
  completedProjects: number;
  avgBid: number;
  reasons: string[];
};

export type BuyerKpi = {
  totalProjects: number;
  totalMoneySpent: number;
  averageBidReceived: number;
  completedProjects: number;
  successfulProjectsPercentage: number;
};

const hashSeed = (value: string) =>
  value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

export const inferSellerLocation = (seller: User | undefined): string => {
  if (!seller) return "Remote";

  const company = seller.companyName?.trim();
  if (company && company.includes(",")) {
    return company.split(",").at(-1)?.trim() || "Remote";
  }

  const phone = seller.phone?.trim() ?? "";
  if (phone.startsWith("+1")) return "United States";
  if (phone.startsWith("+44")) return "United Kingdom";
  if (phone.startsWith("+91")) return "India";

  const fallbackLocations = ["United States", "Canada", "India", "Germany", "Remote"];
  return fallbackLocations[hashSeed(seller.id) % fallbackLocations.length];
};

export const getTimeRemaining = (deadline: string, nowMs = Date.now()): TimeRemaining => {
  const endsAt = new Date(deadline);
  if (deadline.length <= 10) {
    endsAt.setHours(23, 59, 59, 999);
  }

  const totalMs = Math.max(endsAt.getTime() - nowMs, 0);
  const isClosed = totalMs <= 0;

  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    totalMs,
    isClosed,
    days,
    hours,
    minutes,
    label: isClosed ? "Bidding Closed" : `Ends in: ${days} days ${hours} hours ${minutes} minutes`
  };
};

export const getSellerCompletedProjects = (allBids: Bid[], sellerId: string) =>
  allBids.filter((item) => item.sellerId === sellerId && item.status === "accepted").length;

const normalizeValue = (value: number, min: number, max: number) => {
  if (max <= min) return 1;
  return (value - min) / (max - min);
};

export const getBidRecommendationScore = ({
  bid,
  bidsForProject,
  allBids,
  seller,
  project
}: {
  bid: Bid;
  bidsForProject: Bid[];
  allBids: Bid[];
  seller: User | undefined;
  project: Project;
}) => {
  const prices = bidsForProject.map((item) => item.price);
  const deliveries = bidsForProject.map((item) => item.deliveryDays);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);

  const priceScore = (1 - normalizeValue(bid.price, minPrice, maxPrice)) * 40;
  const deliveryScore = (1 - normalizeValue(bid.deliveryDays, minDelivery, maxDelivery)) * 20;
  const ratingScore = Math.max(0, Math.min((seller?.rating ?? 3) / 5, 1)) * 25;

  const completedProjects = getSellerCompletedProjects(allBids, bid.sellerId);
  const completionScore = Math.min(completedProjects / 10, 1) * 10;

  const sellerLocation = inferSellerLocation(seller);
  const locationScore =
    project.location.toLowerCase().includes("remote") || sellerLocation.toLowerCase().includes("remote")
      ? 5
      : sellerLocation.toLowerCase() === project.location.toLowerCase()
      ? 5
      : 2;

  return Math.round(priceScore + deliveryScore + ratingScore + completionScore + locationScore);
};

const getAcceptedBidByProject = (bids: Bid[]) => {
  const map = new Map<string, Bid>();
  bids
    .filter((item) => item.status === "accepted")
    .forEach((bid) => map.set(bid.projectId, bid));
  return map;
};

export const getBuyerKpi = (projects: Project[], bids: Bid[]): BuyerKpi => {
  const acceptedByProject = getAcceptedBidByProject(bids);
  const acceptedBids = projects
    .map((project) => acceptedByProject.get(project.id))
    .filter((item): item is Bid => Boolean(item));

  const totalMoneySpent = acceptedBids.reduce((sum, item) => sum + item.price, 0);
  const averageBidReceived = bids.length ? bids.reduce((sum, item) => sum + item.price, 0) / bids.length : 0;
  const completedProjects = projects.filter((item) => item.status === "completed").length;

  return {
    totalProjects: projects.length,
    totalMoneySpent,
    averageBidReceived,
    completedProjects,
    successfulProjectsPercentage: projects.length ? Math.round((completedProjects / projects.length) * 100) : 0
  };
};

export const getMonthlySpendingData = (projects: Project[], bids: Bid[]) => {
  const acceptedByProject = getAcceptedBidByProject(bids);
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      value: 0
    };
  });

  const monthMap = new Map(months.map((item) => [item.key, item]));

  projects.forEach((project) => {
    const acceptedBid = acceptedByProject.get(project.id);
    if (!acceptedBid) return;

    const created = new Date(acceptedBid.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket) {
      bucket.value += acceptedBid.price;
    }
  });

  return months;
};

export const getCategoryDistribution = (projects: Project[]) => {
  const counts = new Map<string, number>();
  projects.forEach((project) => {
    counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
  });

  const total = projects.length || 1;
  return Array.from(counts.entries()).map(([label, value], index) => ({
    label,
    value,
    percentage: Math.round((value / total) * 100),
    color: ["#0ea5e9", "#22c55e", "#f97316", "#a855f7", "#eab308"][index % 5]
  }));
};

export const getBudgetRangeDistribution = (projects: Project[]) => {
  const ranges = [
    { label: "$0-$100", min: 0, max: 100, value: 0 },
    { label: "$100-$500", min: 100, max: 500, value: 0 },
    { label: "$500-$1000", min: 500, max: 1000, value: 0 },
    { label: "$1000+", min: 1000, max: Number.POSITIVE_INFINITY, value: 0 }
  ];

  projects.forEach((project) => {
    const range = ranges.find((item) => project.budget >= item.min && project.budget < item.max);
    if (range) {
      range.value += 1;
    }
  });

  return ranges.map(({ label, value }) => ({ label, value }));
};

export const getBiddingTrend = (bids: Bid[]) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      value: 0
    };
  });

  const map = new Map(months.map((item) => [item.key, item]));

  bids.forEach((bid) => {
    const created = new Date(bid.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = map.get(key);
    if (bucket) {
      bucket.value += 1;
    }
  });

  return months;
};

export const getRecommendedSellers = ({
  projects,
  bids,
  users
}: {
  projects: Project[];
  bids: Bid[];
  users: User[];
}): SellerRecommendation[] => {
  const sellers = users.filter((item) => item.role === "seller" && !item.blocked);
  const buyerCategories = projects.map((item) => item.category.toLowerCase());
  const dominantLocation = projects.length
    ? projects.reduce<Record<string, number>>((acc, project) => {
        acc[project.location] = (acc[project.location] ?? 0) + 1;
        return acc;
      }, {})
    : {};
  const preferredLocation = Object.entries(dominantLocation).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Remote";
  const avgBudget = projects.length ? projects.reduce((sum, project) => sum + project.budget, 0) / projects.length : 0;

  return sellers
    .map((seller) => {
      const sellerBids = bids.filter((bid) => bid.sellerId === seller.id);
      const avgBid = sellerBids.length
        ? sellerBids.reduce((sum, bid) => sum + bid.price, 0) / sellerBids.length
        : avgBudget || 0;

      const completedProjects = getSellerCompletedProjects(bids, seller.id);
      const ratingScore = Math.max(0, Math.min((seller.rating ?? 3) / 5, 1)) * 35;

      const skills = (seller.skills ?? []).map((item) => item.toLowerCase());
      const matchedCategories = buyerCategories.filter((category) =>
        skills.some((skill) => skill.includes(category) || category.includes(skill))
      ).length;
      const categoryScore = buyerCategories.length ? (matchedCategories / buyerCategories.length) * 25 : 10;

      const budgetDelta = avgBudget > 0 ? Math.abs(avgBudget - avgBid) / avgBudget : 0;
      const budgetScore = Math.max(0, 1 - Math.min(budgetDelta, 1)) * 20;

      const location = inferSellerLocation(seller);
      const locationScore =
        preferredLocation.toLowerCase().includes("remote") || location.toLowerCase().includes("remote")
          ? 10
          : preferredLocation.toLowerCase() === location.toLowerCase()
          ? 20
          : 6;

      const score = Math.round(ratingScore + categoryScore + budgetScore + locationScore);
      const reasons = [
        `${Math.round((seller.rating ?? 3) * 10) / 10}/5 rating`,
        `${completedProjects} completed projects`,
        `Avg bid ${Math.round(avgBid)}`,
        `Location: ${location}`
      ];

      return {
        seller,
        score,
        location,
        completedProjects,
        avgBid,
        reasons
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};

export const getProjectSpecificBids = (bids: Bid[], projectId: string) =>
  bids.filter((item) => item.projectId === projectId);



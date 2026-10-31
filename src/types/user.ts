export interface QueuePass {
  id: string;
  code: string;
  rewardTitle?: string;
  promotionId?: string | null;
  status: "ACTIVE" | "USED";
  usedAt?: string | null;
  usedForConcert?: string | null;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  points: number;
  description?: string | null;
  quota?: number | null;
  maxPerUser?: number | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  redeemedCount?: number;
  remainingQuota?: number | null;
  userRedeemedCount?: number;
  userRemainingQuota?: number | null;
  isExpired?: boolean;
  canRedeem?: boolean;
  reasonDisabled?: string;
}

export interface ReviewSubmission {
  id: string;
  concertName: string;
  xHandle: string;
  postUrl?: string | null;
  imageUrl?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string | null;
  createdAt: string;
}

export interface PointLog {
  id: string;
  amount: number;
  reason: string;
  pass?: {
    code: string;
    status: "ACTIVE" | "USED";
    usedForConcert?: string | null;
    usedAt?: string | null;
  } | null;
  review?: ReviewSubmission | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  lineId: string;
  displayName: string;
  avatarUrl?: string | null;
  xHandle?: string | null;
  phone?: string | null;
  stamps: number;
  tier?: string | null;
  lifetimeStamps?: number;
  passes: QueuePass[];
  reviews: ReviewSubmission[];
  pointLogs: PointLog[];
}

export interface UserContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userData: UserProfile | null;
  setUserData: (user: UserProfile | null) => void;
  isLoad: boolean;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

export type AdminTab = "REVIEWS" | "PROMOTIONS" | "PASSES" | "MEMBERS";

export interface ConfirmModalConfig {
  isOpen?: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  onConfirm: (inputValue?: string) => Promise<void> | void;
}

export interface AdminReview {
  id: string;
  concertName: string;
  xHandle: string;
  postUrl?: string;
  imageUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    xHandle?: string;
    phone?: string;
    stamps: number;
  };
}

export interface AdminPromotion {
  id: string;
  title: string;
  points: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { passes: number };
}

export interface AdminMember {
  id: string;
  displayName: string;
  avatarUrl?: string;
  xHandle?: string;
  phone?: string;
  stamps: number;
  createdAt: string;
  isAdmin?: boolean;
  role?: string;
  _count: { reviews: number; passes: number };
}

export interface AdminPass {
  id: string;
  code: string;
  rewardTitle?: string;
  status: "ACTIVE" | "USED";
  usedAt?: string;
  usedForConcert?: string;
  createdAt: string;
  user: {
    displayName: string;
    xHandle?: string;
    phone?: string;
  };
}

export interface AdminSpecialCode {
  id: string;
  code: string;
  rewardType: "PASS" | "POINTS";
  rewardPoints?: number | null;
  rewardTitle: string;
  maxUses?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    redemptions: number;
  };
}

export interface AdminCodeRedemption {
  id: string;
  createdAt: string;
  code: {
    code: string;
    rewardType: string;
    rewardTitle: string;
    rewardPoints?: number | null;
  };
  user: {
    id: string;
    displayName: string;
    xHandle?: string | null;
    avatarUrl?: string | null;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  mustChangePassword: boolean;
}

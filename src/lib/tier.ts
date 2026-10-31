export type MemberTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";

export interface AvatarMetrics {
  top: string;
  left: string;
  size: string;
}

export interface TierConfig {
  name: MemberTier;
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeImage: string;
  frameImage: string;
  cardFrameImage: string;
  cardBorder: string;
  cardAccent: string;
  progressBarGradient: string;
  avatarMetrics: AvatarMetrics;
}

export const TIER_CONFIGS: Record<MemberTier, TierConfig> = {
  BRONZE: {
    name: "BRONZE",
    label: "Bronze",
    textColor: "text-[#A05A2C]",
    bgColor: "bg-[#FDF3EC]",
    borderColor: "border-[#F4D3C2]",
    badgeImage: "/tiers/badge/bronzebadge.png?v=11",
    frameImage: "/tiers/badge/bronzebadge.png?v=11",
    cardFrameImage: "/tiers/frames/bronzeframe.png?v=12",
    cardBorder: "border-[#E59866]/70",
    cardAccent: "from-[#E59866] via-[#F4D3C2] to-transparent",
    progressBarGradient: "bg-linear-to-r from-[#D97706] to-[#B45309]",
    avatarMetrics: {
      top: "54.0%",
      left: "50.0%",
      size: "60.0%",
    },
  },
  SILVER: {
    name: "SILVER",
    label: "Silver",
    textColor: "text-[#475569]",
    bgColor: "bg-[#F1F5F9]",
    borderColor: "border-[#CBD5E1]",
    badgeImage: "/tiers/badge/silverbadge.png?v=11",
    frameImage: "/tiers/badge/silverbadge.png?v=11",
    cardFrameImage: "/tiers/frames/silverframe.png?v=11",
    cardBorder: "border-[#94A3B8]/70",
    cardAccent: "from-[#94A3B8] via-[#CBD5E1] to-transparent",
    progressBarGradient: "bg-linear-to-r from-[#94A3B8] to-[#64748B]",
    avatarMetrics: {
      top: "53.5%",
      left: "50.0%",
      size: "58.0%",
    },
  },
  GOLD: {
    name: "GOLD",
    label: "Gold",
    textColor: "text-[#B47D00]",
    bgColor: "bg-[#FEF9E7]",
    borderColor: "border-[#FBE79E]",
    badgeImage: "/tiers/badge/goldbadge.png?v=11",
    frameImage: "/tiers/badge/goldbadge.png?v=11",
    cardFrameImage: "/tiers/frames/goldframe.png?v=11",
    cardBorder: "border-[#F1C40F]/80",
    cardAccent: "from-[#F1C40F] via-[#FDE047] to-transparent",
    progressBarGradient: "bg-linear-to-r from-[#F59E0B] to-[#D97706]",
    avatarMetrics: {
      top: "53.5%",
      left: "50.0%",
      size: "55.0%",
    },
  },
  PLATINUM: {
    name: "PLATINUM",
    label: "Platinum",
    textColor: "text-[#0E7490]",
    bgColor: "bg-[#ECFEFF]",
    borderColor: "border-[#A5F3FC]",
    badgeImage: "/tiers/badge/platinumbadge.png?v=11",
    frameImage: "/tiers/badge/platinumbadge.png?v=11",
    cardFrameImage: "/tiers/frames/platinumframe.png?v=11",
    cardBorder: "border-[#06B6D4]/80",
    cardAccent: "from-[#06B6D4] via-[#67E8F9] to-transparent",
    progressBarGradient: "bg-linear-to-r from-[#06B6D4] to-[#0E7490]",
    avatarMetrics: {
      top: "55.0%",
      left: "50.0%",
      size: "54.0%",
    },
  },
  DIAMOND: {
    name: "DIAMOND",
    label: "Diamond",
    textColor: "text-[#6B38FB]",
    bgColor: "bg-[#F3EFFF]",
    borderColor: "border-[#D6C7FE]",
    badgeImage: "/tiers/badge/diamondbadge.png?v=11",
    frameImage: "/tiers/badge/diamondbadge.png?v=11",
    cardFrameImage: "/tiers/frames/diamondframe.png?v=11",
    cardBorder: "border-[#8B5CF6]/80",
    cardAccent: "from-[#8B5CF6] via-[#C084FC] to-transparent",
    progressBarGradient: "bg-linear-to-r from-[#60A5FA] via-[#A855F7] to-[#EC4899]",
    avatarMetrics: {
      top: "54.3%",
      left: "50.0%",
      size: "54.0%",
    },
  },
};

export const TIER_THRESHOLDS: { tier: MemberTier; minPoints: number }[] = [
  { tier: "DIAMOND", minPoints: 100 },
  { tier: "PLATINUM", minPoints: 50 },
  { tier: "GOLD", minPoints: 25 },
  { tier: "SILVER", minPoints: 10 },
  { tier: "BRONZE", minPoints: 0 },
];

export const TIER_ORDER: Record<MemberTier, number> = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  PLATINUM: 3,
  DIAMOND: 4,
};

/**
 * คำนวณระดับสมาชิกอัตโนมัติตามแต้มสะสมทั้งหมด
 */
export function calculateTierFromPoints(points: number): MemberTier {
  for (const item of TIER_THRESHOLDS) {
    if (points >= item.minPoints) {
      return item.tier;
    }
  }
  return "BRONZE";
}

/**
 * ตรวจสอบว่าแต้มที่เพิ่มขึ้นทำให้เลื่อนขั้นสมาชิกหรือไม่ (สำหรับผู้ใช้ที่เป็น AUTO)
 * ส่งกลับ MemberTier ใหม่หากมีการเลื่อนขั้น หรือ null หากคงเดิม/ปรับลด
 */
export function checkTierUpgrade(
  user:
    | { tier?: string | null; lifetimeStamps?: number; stamps?: number }
    | null
    | undefined,
  pointsAdded: number
): MemberTier | null {
  if (!user || pointsAdded <= 0) return null;
  if (user.tier && user.tier !== "AUTO") return null; // Manual tier override by admin

  const oldPoints = Math.max(user.lifetimeStamps || 0, user.stamps || 0);
  const newPoints = oldPoints + pointsAdded;

  const oldTier = calculateTierFromPoints(oldPoints);
  const newTier = calculateTierFromPoints(newPoints);

  if (TIER_ORDER[newTier] > TIER_ORDER[oldTier]) {
    return newTier;
  }

  return null;
}

export interface UserTierInput {
  tier?: string | null;
  lifetimeStamps?: number;
  stamps?: number;
}

/**
 * ดึงระดับสมาชิก (Member Tier)
 * - รองรับทั้งการส่ง User object โดยตรง { tier, lifetimeStamps, stamps } หรือส่งพารามิเตอร์แยก
 * - หากระบุ tier แบบแมนนวล (Manual Override) และตรงกับระดับ ให้ใช้ค่านั้น
 * - หากเป็น null, undefined หรือ "AUTO" ให้คำนวณอัตโนมัติจากแต้มสะสมทั้งหมด (lifetimeStamps หรือ stamps)
 */
export function getMemberTier(
  userOrTier?: UserTierInput | string | null,
  lifetimeStamps?: number,
  stamps?: number
): TierConfig {
  let tierVal: string | null | undefined;
  let ltVal: number | undefined = lifetimeStamps;
  let stVal: number | undefined = stamps;

  if (typeof userOrTier === "object" && userOrTier !== null) {
    tierVal = userOrTier.tier;
    ltVal = userOrTier.lifetimeStamps;
    stVal = userOrTier.stamps;
  } else {
    tierVal = userOrTier;
  }

  if (tierVal && tierVal !== "AUTO" && tierVal in TIER_CONFIGS) {
    return TIER_CONFIGS[tierVal as MemberTier];
  }
  const effectivePoints = Math.max(ltVal ?? 0, stVal ?? 0);
  const calculatedTier = calculateTierFromPoints(effectivePoints);
  return TIER_CONFIGS[calculatedTier];
}

export interface TierProgress {
  currentTier: MemberTier;
  currentTierLabel: string;
  nextTier: MemberTier | null;
  nextTierLabel: string | null;
  currentPoints: number;
  nextTierMinPoints: number;
  pointsNeeded: number;
  progressPercent: number;
  isMaxTier: boolean;
}

/**
 * คำนวณความคืบหน้าในการเลื่อนขั้นระดับสมาชิก
 */
export function getTierProgress(
  userOrTier?: UserTierInput | string | null,
  lifetimeStamps?: number,
  stamps?: number
): TierProgress {
  let ltVal: number | undefined = lifetimeStamps;
  let stVal: number | undefined = stamps;
  let manualTier: string | null | undefined;

  if (typeof userOrTier === "object" && userOrTier !== null) {
    manualTier = userOrTier.tier;
    ltVal = userOrTier.lifetimeStamps;
    stVal = userOrTier.stamps;
  } else if (typeof userOrTier === "string") {
    manualTier = userOrTier;
  }

  // Current tier MUST match getMemberTier (Single Source of Truth)
  const memberTierConfig = getMemberTier(userOrTier, lifetimeStamps, stamps);
  const currentTier = memberTierConfig.name;
  const currentTierConfig = TIER_CONFIGS[currentTier];

  const tierOrder: MemberTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
  const currentIndex = tierOrder.indexOf(currentTier);

  // If user is at max tier (DIAMOND)
  if (currentIndex >= tierOrder.length - 1) {
    const effectivePoints = Math.max(ltVal ?? 0, stVal ?? 0);
    return {
      currentTier,
      currentTierLabel: currentTierConfig.label,
      nextTier: null,
      nextTierLabel: null,
      currentPoints: effectivePoints,
      nextTierMinPoints: 100,
      pointsNeeded: 0,
      progressPercent: 100,
      isMaxTier: true,
    };
  }

  const nextTier = tierOrder[currentIndex + 1];
  const nextTierConfig = TIER_CONFIGS[nextTier];
  const nextTierThreshold = TIER_THRESHOLDS.find((t) => t.tier === nextTier)!.minPoints;

  // Calculate points for progress:
  // If tier is manual override (e.g. demoted), use current stamps if lifetimeStamps >= nextTierThreshold
  let displayPoints = stVal ?? 0;
  if (!manualTier || manualTier === "AUTO") {
    displayPoints = Math.max(ltVal ?? 0, stVal ?? 0);
  } else {
    if (ltVal !== undefined && ltVal < nextTierThreshold) {
      displayPoints = Math.max(ltVal, stVal ?? 0);
    } else {
      displayPoints = Math.min(stVal ?? 0, nextTierThreshold - 1);
    }
  }

  const pointsNeeded = Math.max(0, nextTierThreshold - displayPoints);
  const progressPercent = Math.min(
    99,
    Math.max(0, Math.round((displayPoints / nextTierThreshold) * 100))
  );

  return {
    currentTier,
    currentTierLabel: currentTierConfig.label,
    nextTier,
    nextTierLabel: nextTierConfig.label,
    currentPoints: displayPoints,
    nextTierMinPoints: nextTierThreshold,
    pointsNeeded,
    progressPercent,
    isMaxTier: false,
  };
}

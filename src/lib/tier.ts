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
    cardFrameImage: "/tiers/frames/bronzeframe.png?v=11",
    cardBorder: "border-[#E59866]/70",
    cardAccent: "from-[#E59866] via-[#F4D3C2] to-transparent",
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

"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Promotion, QueuePass, UserProfile } from "@/types/user";

interface UseUserPromotionsOptions {
  token: string | null;
  user: UserProfile | null;
  refreshUserData: () => Promise<void>;
  onRedeemSuccess?: () => void;
}

export function useUserPromotions({
  token,
  user,
  refreshUserData,
  onRedeemSuccess,
}: UseUserPromotionsOptions) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  const loadPromotions = useCallback(async () => {
    setPromotionsLoading(true);
    try {
      const res = await fetch("/api/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(data.promotions || []);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setPromotionsLoading(false);
    }
  }, []);

  const handleRedeem = async (promo: Promotion): Promise<QueuePass | null> => {
    if (!user || !token) return null;
    if (user.stamps < promo.points) {
      toast.error(`แต้มไม่เพียงพอ ขาดอีก ${promo.points - user.stamps} แต้ม`);
      return null;
    }

    try {
      const res = await fetch("/api/promotions/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promotionId: promo.id }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "แลกรับสิทธิ์เรียบร้อยแล้ว!");
        await refreshUserData();
        onRedeemSuccess?.();
        return data.pass || null;
      } else {
        toast.error(data.message || "แลกรับสิทธิ์ไม่สำเร็จ");
        return null;
      }
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      return null;
    }
  };

  return {
    promotions,
    promotionsLoading,
    showExchangeModal,
    setShowExchangeModal,
    loadPromotions,
    handleRedeem,
  };
}

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
      const res = await fetch("/api/promotions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setPromotions(data.promotions || []);
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setPromotionsLoading(false);
    }
}, [token]);

const handleRedeem = async (
  promo: Promotion,
  quantity: number = 1
): Promise<QueuePass[] | null> => {
  if (!user || !token) return null;
  const totalPoints = promo.points * quantity;
  if (user.stamps < totalPoints) {
    toast.error(`แต้มไม่เพียงพอ ขาดอีก ${totalPoints - user.stamps} แต้ม`);
    return null;
  }

  try {
    const res = await fetch("/api/promotions/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ promotionId: promo.id, quantity }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "แลกรับสิทธิ์เรียบร้อยแล้ว!");
      await refreshUserData();
      void loadPromotions();
      onRedeemSuccess?.();
      if (data.passes && Array.isArray(data.passes)) {
        return data.passes;
      }
      return data.pass ? [data.pass] : null;
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

"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { adminFetch } from "@/lib/adminApi";
import { AdminPromotion, AdminSpecialCode } from "../types";

export interface UseAdminPromotionsOptions {
  adminToken: string;
  onRefreshAll?: () => Promise<void>;
}

export function generateSpecialCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 7; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LELE${randomPart}`;
}

export function useAdminPromotions({ adminToken, onRefreshAll }: UseAdminPromotionsOptions) {
  // Sub-tab: PROMOTIONS vs SPECIAL_CODES
  const [promotionsSubTab, setPromotionsSubTab] = useState<"PROMOTIONS" | "SPECIAL_CODES">("PROMOTIONS");

  // Regular Promotions
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [promotionsTotal, setPromotionsTotal] = useState(0);
  const [promotionsPage, setPromotionsPage] = useState(1);
  const [promotionsTotalPages, setPromotionsTotalPages] = useState(1);
  const [promotionsSearch, setPromotionsSearch] = useState("");
  const [promotionsStatus, setPromotionsStatus] = useState("ALL");
  const [promotionsSortBy, setPromotionsSortBy] = useState<
    "title" | "points" | "redeemed" | "status" | ""
  >("");
  const [promotionsSortOrder, setPromotionsSortOrder] = useState<"asc" | "desc">("desc");
  const [activePromotionsCount, setActivePromotionsCount] = useState(0);
  const [promotionsLoading, setPromotionsLoading] = useState(true);

  // Special Codes
  const [specialCodes, setSpecialCodes] = useState<AdminSpecialCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesSearch, setCodesSearch] = useState("");
  const [codesStatus, setCodesStatus] = useState("ALL");
  const [codesPage, setCodesPage] = useState(1);
  const [codesSortBy, setCodesSortBy] = useState<
    "code" | "reward" | "quota" | "expiresAt" | "status" | ""
  >("");
  const [codesSortOrder, setCodesSortOrder] = useState<"asc" | "desc">("desc");

  // Create / Edit Special Code Modal State
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState<AdminSpecialCode | null>(null);
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeRewardType, setNewCodeRewardType] = useState<"PASS" | "POINTS">("PASS");
  const [newCodePoints, setNewCodePoints] = useState("1");
  const [newCodeTitle, setNewCodeTitle] = useState("ของรางวัลพิเศษ");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState("");
  const [newCodeExpiresAt, setNewCodeExpiresAt] = useState("");
  const [newCodeActive, setNewCodeActive] = useState(true);
  const [savingNewCode, setSavingNewCode] = useState(false);

  // Promo Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoPoints, setPromoPoints] = useState("");
  const [promoDesc, setPromoDesc] = useState("");
  const [promoActive, setPromoActive] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);

  // Client-side current timestamp (avoids Next.js prerender dynamic error)
  const [currentTime, setCurrentTime] = useState<number>(0);
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentTime(Date.now());
    });
  }, []);

  const fetchPromotions = useCallback(
    async (
      token = adminToken,
      page = promotionsPage,
      q = promotionsSearch,
      status = promotionsStatus,
      sortBy = promotionsSortBy,
      sortOrder = promotionsSortOrder,
    ) => {
      if (!token) return;
      setPromotionsLoading(true);
      try {
        const res = await adminFetch(
          `/api/admin/promotions?page=${page}&limit=10&q=${encodeURIComponent(q)}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          { token },
        );
        if (res.ok) {
          const d = await res.json();
          setPromotions(d.promotions || []);
          setPromotionsTotal(d.total || 0);
          setPromotionsTotalPages(d.totalPages || 1);
          setActivePromotionsCount(d.activeCount || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPromotionsLoading(false);
      }
    },
    [adminToken, promotionsPage, promotionsSearch, promotionsStatus, promotionsSortBy, promotionsSortOrder],
  );

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchPromotions();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, promotionsPage, promotionsSearch, promotionsStatus, promotionsSortBy, promotionsSortOrder, fetchPromotions]);

  const handleSortPromotions = (field: "title" | "points" | "redeemed" | "status") => {
    if (promotionsSortBy === field) {
      setPromotionsSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setPromotionsSortBy(field);
      setPromotionsSortOrder(field === "points" || field === "title" ? "asc" : "desc");
    }
  };

  const openCreatePromoModal = () => {
    setEditingPromo(null);
    setPromoTitle("");
    setPromoPoints("");
    setPromoDesc("");
    setPromoActive(true);
    setShowPromoModal(true);
  };

  const openEditPromoModal = (promo: AdminPromotion) => {
    setEditingPromo(promo);
    setPromoTitle(promo.title);
    setPromoPoints(promo.points.toString());
    setPromoDesc(promo.description || "");
    setPromoActive(promo.isActive);
    setShowPromoModal(true);
  };

  const closePromoModal = () => {
    setShowPromoModal(false);
    setEditingPromo(null);
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoPoints) {
      toast.error("กรุณากรอกชื่อและจำนวนแต้ม");
      return;
    }
    setSavingPromo(true);
    try {
      const isEdit = Boolean(editingPromo);
      const url = "/api/admin/promotions";
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        ...(isEdit && { id: editingPromo!.id }),
        title: promoTitle,
        points: promoPoints,
        description: promoDesc,
        isActive: promoActive,
      };

      const res = await adminFetch(url, {
        method,
        token: adminToken,
        json: body,
      });

      if (res.ok) {
        toast.success(
          isEdit ? "แก้ไขโปรโมชั่นเรียบร้อยแล้ว" : "เพิ่มโปรโมชั่นเรียบร้อยแล้ว",
        );
        closePromoModal();
        await fetchPromotions();
        if (onRefreshAll) await onRefreshAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "บันทึกโปรโมชั่นไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromotion = async (promo: AdminPromotion) => {
    try {
      const res = await adminFetch("/api/admin/promotions", {
        method: "PATCH",
        token: adminToken,
        json: { id: promo.id, isActive: !promo.isActive },
      });
      if (res.ok) {
        toast.success(
          promo.isActive ? "พักสิทธิ์โปรโมชั่นแล้ว" : "เปิดให้แลกโปรโมชั่นแล้ว",
        );
        await fetchPromotions();
        if (onRefreshAll) await onRefreshAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "เปลี่ยนสถานะไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Toggle promotion error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const executeDeletePromotion = async (id: string, title: string) => {
    try {
      const res = await adminFetch(`/api/admin/promotions?id=${id}`, {
        method: "DELETE",
        token: adminToken,
      });
      if (res.ok) {
        toast.success(`ลบโปรโมชั่น "${title}" เรียบร้อยแล้ว`);
        await fetchPromotions();
        if (onRefreshAll) await onRefreshAll();
        return true;
      } else {
        const err = await res.json();
        toast.error(err.error || "ลบโปรโมชั่นไม่สำเร็จ");
        return false;
      }
    } catch (err) {
      console.error("Delete promotion error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      return false;
    }
  };

  const fetchSpecialCodes = useCallback(
    async (token = adminToken, q = codesSearch) => {
      if (!token) return;
      setCodesLoading(true);
      try {
        const res = await adminFetch(`/api/admin/codes?q=${encodeURIComponent(q)}`, {
          token,
        });
        if (res.ok) {
          const d = await res.json();
          setSpecialCodes(d.codes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCodesLoading(false);
      }
    },
    [adminToken, codesSearch],
  );

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchSpecialCodes();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, fetchSpecialCodes]);

  const handleSortCodes = (field: string) => {
    if (codesSortBy === field) {
      setCodesSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setCodesSortBy(field as "code" | "reward" | "quota" | "expiresAt" | "status");
      setCodesSortOrder("asc");
    }
  };

  const filteredSpecialCodes = useMemo(() => {
    const list = specialCodes.filter((c) => {
      const isExpired = Boolean(currentTime && c.expiresAt) && new Date(c.expiresAt!).getTime() < currentTime;
      if (codesStatus === "ACTIVE") return c.isActive && !isExpired;
      if (codesStatus === "INACTIVE") return !c.isActive && !isExpired;
      if (codesStatus === "EXPIRED") return isExpired;
      return true;
    });

    if (!codesSortBy) return list;

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (codesSortBy === "code") {
        cmp = a.code.localeCompare(b.code);
      } else if (codesSortBy === "reward") {
        cmp = (a.rewardTitle || "").localeCompare(b.rewardTitle || "");
      } else if (codesSortBy === "quota") {
        cmp = a.usedCount - b.usedCount;
      } else if (codesSortBy === "expiresAt") {
        const timeA = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
        const timeB = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
        cmp = timeA - timeB;
      } else if (codesSortBy === "status") {
        const getRank = (item: AdminSpecialCode) => {
          if (currentTime && item.expiresAt && new Date(item.expiresAt).getTime() < currentTime) return 0; // EXPIRED
          if (item.isActive) return 2; // ACTIVE
          return 1; // INACTIVE
        };
        cmp = getRank(a) - getRank(b);
      }
      return codesSortOrder === "asc" ? cmp : -cmp;
    });
  }, [specialCodes, codesStatus, codesSortBy, codesSortOrder, currentTime]);

  const codesPageSize = 10;
  const codesTotalPages = Math.max(1, Math.ceil(filteredSpecialCodes.length / codesPageSize));

  const paginatedSpecialCodes = useMemo(() => {
    const start = (codesPage - 1) * codesPageSize;
    return filteredSpecialCodes.slice(start, start + codesPageSize);
  }, [filteredSpecialCodes, codesPage]);

  const openCreateCodeModal = () => {
    setEditingCode(null);
    setNewCodeName(generateSpecialCode());
    setNewCodeRewardType("PASS");
    setNewCodeTitle("ของรางวัลพิเศษ");
    setNewCodePoints("1");
    setNewCodeMaxUses("");
    setNewCodeExpiresAt("");
    setNewCodeActive(true);
    setShowCreateCodeModal(true);
  };

  const openEditCodeModal = (codeItem: AdminSpecialCode) => {
    setEditingCode(codeItem);
    setNewCodeName(codeItem.code);
    setNewCodeRewardType(codeItem.rewardType);
    setNewCodePoints((codeItem.rewardPoints || 1).toString());
    setNewCodeTitle(codeItem.rewardTitle);
    setNewCodeMaxUses(
      codeItem.maxUses !== null && codeItem.maxUses !== undefined
        ? codeItem.maxUses.toString()
        : "",
    );
    if (codeItem.expiresAt) {
      const d = new Date(codeItem.expiresAt);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, "0");
        setNewCodeExpiresAt(
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
        );
      } else {
        setNewCodeExpiresAt("");
      }
    } else {
      setNewCodeExpiresAt("");
    }
    setNewCodeActive(codeItem.isActive);
    setShowCreateCodeModal(true);
  };

  const closeCreateCodeModal = () => {
    setShowCreateCodeModal(false);
    setEditingCode(null);
    setNewCodeName("");
    setNewCodeRewardType("PASS");
    setNewCodePoints("1");
    setNewCodeTitle("ของรางวัลพิเศษ");
    setNewCodeMaxUses("");
    setNewCodeExpiresAt("");
    setNewCodeActive(true);
  };

  const handleSaveNewCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCodeName.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("กรุณาระบุรหัสโค้ด");
      return;
    }
    if (newCodeRewardType === "POINTS" && (!newCodePoints || parseInt(newCodePoints, 10) <= 0)) {
      toast.error("กรุณาระบุจำนวนแต้มสะสมอย่างน้อย 1 แต้ม");
      return;
    }
    if (!newCodeTitle.trim()) {
      toast.error("กรุณาระบุชื่อของรางวัล");
      return;
    }

    setSavingNewCode(true);
    try {
      const isEdit = Boolean(editingCode);
      const url = "/api/admin/codes";
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        ...(isEdit && { codeId: editingCode!.id }),
        code: cleanCode,
        rewardType: newCodeRewardType,
        rewardPoints:
          newCodeRewardType === "POINTS" ? parseInt(newCodePoints, 10) : undefined,
        rewardTitle: newCodeTitle.trim(),
        maxUses: newCodeMaxUses ? parseInt(newCodeMaxUses, 10) : null,
        expiresAt: newCodeExpiresAt ? new Date(newCodeExpiresAt).toISOString() : null,
        ...(isEdit && { isActive: newCodeActive }),
      };

      const res = await adminFetch(url, {
        method,
        token: adminToken,
        json: body,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          isEdit ? "แก้ไขโค้ดพิเศษเรียบร้อยแล้ว" : data.message || "สร้างโค้ดสำเร็จ",
        );
        closeCreateCodeModal();
        await fetchSpecialCodes();
        if (onRefreshAll) await onRefreshAll();
      } else {
        toast.error(data.error || "บันทึกข้อมูลโค้ดไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingNewCode(false);
    }
  };

  const handleToggleCodeActive = async (codeItem: AdminSpecialCode) => {
    try {
      const res = await adminFetch("/api/admin/codes", {
        method: "PATCH",
        token: adminToken,
        json: {
          codeId: codeItem.id,
          isActive: !codeItem.isActive,
        },
      });

      if (res.ok) {
        toast.success(
          !codeItem.isActive
            ? `เปิดใช้งานโค้ด "${codeItem.code}" เรียบร้อยแล้ว`
            : `ปิดใช้งานโค้ด "${codeItem.code}" เรียบร้อยแล้ว`,
        );
        await fetchSpecialCodes();
        if (onRefreshAll) await onRefreshAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const executeDeleteCode = async (codeItem: AdminSpecialCode) => {
    try {
      const res = await adminFetch(`/api/admin/codes?codeId=${codeItem.id}`, {
        method: "DELETE",
        token: adminToken,
      });
      if (res.ok) {
        toast.success(`ลบโค้ด "${codeItem.code}" เรียบร้อยแล้ว`);
        await fetchSpecialCodes();
        if (onRefreshAll) await onRefreshAll();
        return true;
      } else {
        const err = await res.json();
        toast.error(err.error || "ลบโค้ดไม่สำเร็จ");
        return false;
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      return false;
    }
  };

  return {
    promotionsSubTab,
    setPromotionsSubTab,
    promotions,
    promotionsTotal,
    promotionsPage,
    promotionsTotalPages,
    promotionsSearch,
    promotionsStatus,
    promotionsSortBy,
    promotionsSortOrder,
    activePromotionsCount,
    promotionsLoading,
    specialCodes,
    filteredSpecialCodes,
    paginatedSpecialCodes,
    codesLoading,
    codesSearch,
    codesStatus,
    codesPage,
    codesTotalPages,
    showCreateCodeModal,
    newCodeName,
    newCodeRewardType,
    newCodePoints,
    newCodeTitle,
    newCodeMaxUses,
    newCodeExpiresAt,
    savingNewCode,
    showPromoModal,
    editingPromo,
    promoTitle,
    promoPoints,
    promoDesc,
    promoActive,
    savingPromo,
    setPromotionsPage,
    setPromotionsSearch,
    setPromotionsStatus,
    setCodesSearch,
    setCodesStatus,
    setCodesPage,
    setNewCodeName,
    setNewCodeRewardType,
    setNewCodePoints,
    setNewCodeTitle,
    setNewCodeMaxUses,
    setNewCodeExpiresAt,
    setPromoTitle,
    setPromoPoints,
    setPromoDesc,
    setPromoActive,
    handleSortPromotions,
    openCreatePromoModal,
    openEditPromoModal,
    closePromoModal,
    handleSavePromotion,
    handleTogglePromotion,
    executeDeletePromotion,
    fetchPromotions,
    fetchSpecialCodes,
    editingCode,
    newCodeActive,
    setNewCodeActive,
    codesSortBy,
    codesSortOrder,
    handleSortCodes,
    openEditCodeModal,
    openCreateCodeModal,
    closeCreateCodeModal,
    currentTime,
    handleSaveNewCode,
    handleToggleCodeActive,
    executeDeleteCode,
  };
}

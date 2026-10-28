"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { adminFetch } from "@/lib/adminApi";
import { AdminPass, AdminCodeRedemption } from "../types";

export interface UseAdminPassesOptions {
  adminToken: string;
  onRefreshAll?: () => Promise<void>;
}

export function useAdminPasses({ adminToken, onRefreshAll }: UseAdminPassesOptions) {
  // Sub-tab: PASSES vs REDEMPTION_LOGS
  const [passesSubTab, setPassesSubTab] = useState<"PASSES" | "REDEMPTION_LOGS">("PASSES");

  // Regular Passes
  const [passes, setPasses] = useState<AdminPass[]>([]);
  const [passesTotal, setPassesTotal] = useState(0);
  const [passesPage, setPassesPage] = useState(1);
  const [passesTotalPages, setPassesTotalPages] = useState(1);
  const [passesSearch, setPassesSearch] = useState("");
  const [passesStatus, setPassesStatus] = useState("ALL");
  const [passesSortBy, setPassesSortBy] = useState<
    "code" | "reward" | "customer" | "createdAt" | "status" | ""
  >("");
  const [passesSortOrder, setPassesSortOrder] = useState<"asc" | "desc">("desc");
  const [passesLoading, setPassesLoading] = useState(true);

  // Redemption Logs
  const [codeRedemptions, setCodeRedemptions] = useState<AdminCodeRedemption[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsSearch, setRedemptionsSearch] = useState("");
  const [redemptionsFilter, setRedemptionsFilter] = useState("ALL");
  const [redemptionsPage, setRedemptionsPage] = useState(1);
  const [redemptionsSortBy, setRedemptionsSortBy] = useState<
    "createdAt" | "code" | "user" | "reward" | ""
  >("");
  const [redemptionsSortOrder, setRedemptionsSortOrder] = useState<"asc" | "desc">("desc");

  // Inspect Pass Modal
  const [inspectingPass, setInspectingPass] = useState<AdminPass | null>(null);
  const [passConcertInput, setPassConcertInput] = useState("");
  const [passActionLoading, setPassActionLoading] = useState(false);

  const fetchPasses = useCallback(
    async (
      token = adminToken,
      page = passesPage,
      q = passesSearch,
      status = passesStatus,
      sortBy = passesSortBy,
      sortOrder = passesSortOrder,
    ) => {
      if (!token) return;
      setPassesLoading(true);
      try {
        const res = await adminFetch(
          `/api/admin/passes?page=${page}&limit=10&q=${encodeURIComponent(q)}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          { token },
        );
        if (res.ok) {
          const d = await res.json();
          setPasses(d.passes || []);
          setPassesTotal(d.total || 0);
          setPassesTotalPages(d.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPassesLoading(false);
      }
    },
    [adminToken, passesPage, passesSearch, passesStatus, passesSortBy, passesSortOrder],
  );

  const fetchCodeRedemptions = useCallback(
    async (token = adminToken, q = redemptionsSearch) => {
      if (!token) return;
      setRedemptionsLoading(true);
      try {
        const res = await adminFetch(`/api/admin/codes?q=${encodeURIComponent(q)}`, {
          token,
        });
        if (res.ok) {
          const d = await res.json();
          setCodeRedemptions(d.redemptions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRedemptionsLoading(false);
      }
    },
    [adminToken, redemptionsSearch],
  );

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchPasses();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, passesPage, passesSearch, passesStatus, passesSortBy, passesSortOrder, fetchPasses]);

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchCodeRedemptions();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, fetchCodeRedemptions]);

  const filteredRedemptions = useMemo(() => {
    const list = codeRedemptions.filter((r) => {
      if (redemptionsFilter === "ALL") return true;
      return r.code.rewardType === redemptionsFilter;
    });

    if (!redemptionsSortBy) return list;

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (redemptionsSortBy === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (redemptionsSortBy === "code") {
        cmp = (a.code?.code || "").localeCompare(b.code?.code || "");
      } else if (redemptionsSortBy === "user") {
        cmp = (a.user?.displayName || "").localeCompare(b.user?.displayName || "");
      } else if (redemptionsSortBy === "reward") {
        cmp = (a.code?.rewardTitle || "").localeCompare(b.code?.rewardTitle || "");
      }
      return redemptionsSortOrder === "asc" ? cmp : -cmp;
    });
  }, [codeRedemptions, redemptionsFilter, redemptionsSortBy, redemptionsSortOrder]);

  const redemptionsPageSize = 10;
  const redemptionsTotalPages = Math.max(1, Math.ceil(filteredRedemptions.length / redemptionsPageSize));

  const paginatedRedemptions = useMemo(() => {
    const start = (redemptionsPage - 1) * redemptionsPageSize;
    return filteredRedemptions.slice(start, start + redemptionsPageSize);
  }, [filteredRedemptions, redemptionsPage]);

  const handleSortPasses = (field: "code" | "reward" | "customer" | "createdAt" | "status") => {
    if (passesSortBy === field) {
      setPassesSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setPassesSortBy(field);
      setPassesSortOrder(field === "createdAt" ? "desc" : "asc");
    }
  };

  const handleSortRedemptions = (field: string) => {
    const validField = field as "createdAt" | "code" | "user" | "reward";
    if (redemptionsSortBy === validField) {
      setRedemptionsSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setRedemptionsSortBy(validField);
      setRedemptionsSortOrder(validField === "createdAt" ? "desc" : "asc");
    }
  };

  const openPassDetail = (p: AdminPass) => {
    setInspectingPass(p);
    setPassConcertInput(p.usedForConcert || "");
  };

  const closePassModal = () => {
    setInspectingPass(null);
    setPassConcertInput("");
  };

  const executePassAction = async (
    code: string,
    action: "USE" | "REVERT",
    concertName?: string,
  ): Promise<boolean> => {
    setPassActionLoading(true);
    try {
      const res = await adminFetch("/api/admin/passes", {
        method: "POST",
        token: adminToken,
        json: {
          code,
          concertName,
          action,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          action === "USE" ? "ตัดสิทธิ์คูปองเรียบร้อยแล้ว" : "ยกเลิกการตัดสิทธิ์เรียบร้อยแล้ว",
        );
        closePassModal();
        await fetchPasses();
        if (onRefreshAll) await onRefreshAll();
        return true;
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการตัดสิทธิ์");
        return false;
      }
    } catch {
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      return false;
    } finally {
      setPassActionLoading(false);
    }
  };

  return {
    passesSubTab,
    setPassesSubTab,
    passes,
    passesTotal,
    passesPage,
    passesTotalPages,
    passesSearch,
    passesStatus,
    passesSortBy,
    passesSortOrder,
    passesLoading,
    codeRedemptions,
    filteredRedemptions,
    paginatedRedemptions,
    redemptionsLoading,
    redemptionsSearch,
    redemptionsFilter,
    redemptionsPage,
    redemptionsTotalPages,
    redemptionsSortBy,
    redemptionsSortOrder,
    handleSortRedemptions,
    setRedemptionsSearch,
    setRedemptionsFilter,
    setRedemptionsPage,
    inspectingPass,
    passConcertInput,
    passActionLoading,
    setPassesPage,
    setPassesSearch,
    setPassesStatus,
    setPassConcertInput,
    handleSortPasses,
    openPassDetail,
    closePassModal,
    executePassAction,
    fetchPasses,
    fetchCodeRedemptions,
  };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { adminFetch } from "@/lib/adminApi";
import { AdminReview } from "../types";

export interface UseAdminReviewsOptions {
  adminToken: string;
  onRefreshAll?: () => Promise<void>;
}

export function useAdminReviews({ adminToken, onRefreshAll }: UseAdminReviewsOptions) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsSearch, setReviewsSearch] = useState("");
  const [reviewsStatus, setReviewsStatus] = useState("ALL");
  const [reviewsSortBy, setReviewsSortBy] = useState<
    "concertName" | "customer" | "createdAt" | "status"
  >("createdAt");
  const [reviewsSortOrder, setReviewsSortOrder] = useState<"asc" | "desc">("desc");
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Modal inspection
  const [inspectingReview, setInspectingReview] = useState<AdminReview | null>(null);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  const fetchReviews = useCallback(
    async (
      token = adminToken,
      page = reviewsPage,
      q = reviewsSearch,
      status = reviewsStatus,
      sortBy = reviewsSortBy,
      sortOrder = reviewsSortOrder,
    ) => {
      if (!token) return;
      setReviewsLoading(true);
      try {
        const res = await adminFetch(
          `/api/admin/reviews?page=${page}&limit=10&q=${encodeURIComponent(q)}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          { token },
        );
        if (res.ok) {
          const d = await res.json();
          setReviews(d.reviews || []);
          setReviewsTotal(d.total || 0);
          setReviewsTotalPages(d.totalPages || 1);
          setPendingReviewsCount(d.pendingCount || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setReviewsLoading(false);
      }
    },
    [adminToken, reviewsPage, reviewsSearch, reviewsStatus, reviewsSortBy, reviewsSortOrder],
  );

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchReviews();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, reviewsPage, reviewsSearch, reviewsStatus, reviewsSortBy, reviewsSortOrder, fetchReviews]);

  const handleSortReviews = (field: "concertName" | "customer" | "createdAt" | "status") => {
    if (reviewsSortBy === field) {
      setReviewsSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setReviewsSortBy(field);
      setReviewsSortOrder(field === "createdAt" ? "desc" : "asc");
    }
  };

  const openReviewDetail = (rev: AdminReview) => {
    setInspectingReview(rev);
  };

  const closeReviewModal = () => {
    setInspectingReview(null);
  };

  const executeReviewAction = async (
    reviewId: string,
    action: "APPROVE" | "REJECT" | "PENDING",
    reason?: string,
  ) => {
    setReviewActionLoading(true);
    try {
      const res = await adminFetch("/api/admin/reviews", {
        method: "POST",
        token: adminToken,
        json: { reviewId, action, rejectReason: reason },
      });

      if (res.ok) {
        toast.success(
          action === "APPROVE"
            ? "อนุมัติรีวิวและเพิ่ม 1 แต้มเรียบร้อยแล้ว"
            : action === "REJECT"
              ? "ปฏิเสธรีวิวเรียบร้อย"
              : "เปลี่ยนสถานะรีวิวเรียบร้อย",
        );
        await fetchReviews();
        if (onRefreshAll) await onRefreshAll();
        return true;
      } else {
        const err = await res.json();
        toast.error(err.error || "เกิดข้อผิดพลาด");
        return false;
      }
    } catch {
      toast.error("เชื่อมต่อไม่สำเร็จ");
      return false;
    } finally {
      setReviewActionLoading(false);
    }
  };

  return {
    reviews,
    reviewsTotal,
    reviewsPage,
    reviewsTotalPages,
    reviewsSearch,
    reviewsStatus,
    reviewsSortBy,
    reviewsSortOrder,
    pendingReviewsCount,
    reviewsLoading,
    inspectingReview,
    reviewActionLoading,
    setReviewsPage,
    setReviewsSearch,
    setReviewsStatus,
    handleSortReviews,
    openReviewDetail,
    closeReviewModal,
    executeReviewAction,
    fetchReviews,
  };
}

"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { formatThaiDateTime } from "@/lib/date";
import { getMemberTier } from "@/lib/tier";
import AdminFilterBar from "../AdminFilterBar";
import AdminDataTable, { ColumnDef } from "../AdminDataTable";
import InspectReviewModal from "../modals/InspectReviewModal";
import { AdminReview, ConfirmModalConfig } from "../types";

export interface ReviewsTabProps {
  reviews: AdminReview[];
  reviewsTotal: number;
  reviewsPage: number;
  reviewsTotalPages: number;
  reviewsSearch: string;
  reviewsStatus: string;
  reviewsSortBy: "concertName" | "customer" | "xHandle" | "createdAt" | "status";
  reviewsSortOrder: "asc" | "desc";
  reviewsLoading: boolean;
  inspectingReview: AdminReview | null;
  reviewActionLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSort: (field: "concertName" | "customer" | "xHandle" | "createdAt" | "status") => void;
  onOpenDetail: (review: AdminReview) => void;
  onCloseDetail: () => void;
  onExecuteAction: (
    reviewId: string,
    action: "APPROVE" | "REJECT" | "PENDING",
    reason?: string,
  ) => Promise<boolean>;
  openConfirmModal: (config: ConfirmModalConfig) => void;
}

export default function ReviewsTab({
  reviews,
  reviewsTotal,
  reviewsPage,
  reviewsTotalPages,
  reviewsSearch,
  reviewsStatus,
  reviewsSortBy,
  reviewsSortOrder,
  reviewsLoading,
  inspectingReview,
  reviewActionLoading,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onSort,
  onOpenDetail,
  onCloseDetail,
  onExecuteAction,
  openConfirmModal,
}: ReviewsTabProps) {
  const promptApproveReview = (rev: AdminReview) => {
    const isRevert = rev.status === "REJECTED";
    openConfirmModal({
      title: isRevert ? "เปลี่ยนสถานะเป็นอนุมัติ" : "ยืนยันอนุมัติรีวิว",
      message: `ต้องการอนุมัติรีวิวงาน "${rev.concertName}" และเพิ่ม 1 แต้มให้คุณ ${rev.user.displayName} ใช่หรือไม่?`,
      confirmText: isRevert ? "เปลี่ยนเป็นอนุมัติ" : "อนุมัติ",
      onConfirm: async () => {
        const success = await onExecuteAction(rev.id, "APPROVE");
        if (success) onCloseDetail();
      },
    });
  };

  const promptRejectReview = (rev: AdminReview) => {
    const isRevert = rev.status === "APPROVED";
    openConfirmModal({
      title: isRevert ? "เปลี่ยนสถานะเป็นไม่อนุมัติ" : "ไม่อนุมัติรีวิว",
      message: isRevert
        ? `ระบบจะดึงแต้มสะสม 1 แต้มคืนจากคุณ ${rev.user.displayName} โปรดระบุเหตุผลให้ลูกค้าทราบ:`
        : `ระบุเหตุผลที่ไม่อนุมัติรีวิวงาน "${rev.concertName}" เพื่อแจ้งให้คุณ ${rev.user.displayName} ทราบ:`,
      inputLabel: "เหตุผลที่ไม่อนุมัติ",
      defaultValue: isRevert
        ? "หลักฐานไม่ถูกต้อง หรือมีการยกเลิกโพสต์"
        : "ไม่พบโพสต์รีวิว หรือหลักฐานไม่ชัดเจน",
      confirmText: isRevert ? "เปลี่ยนเป็นไม่อนุมัติ" : "ยืนยันไม่อนุมัติ",
      isDestructive: false,
      onConfirm: async (reason) => {
        const success = await onExecuteAction(rev.id, "REJECT", reason);
        if (success) onCloseDetail();
      },
    });
  };

  const reviewColumns: ColumnDef<AdminReview>[] = [
    {
      key: "concertName",
      header: "ชื่องานคอนเสิร์ต",
      sortable: true,
      className: "font-bold text-[#25384C] max-w-45 sm:max-w-55",
      render: (rev) => (
        <span className="truncate block" title={rev.concertName}>
          {rev.concertName}
        </span>
      ),
    },
    {
      key: "customer",
      header: "ข้อมูลลูกค้า",
      sortable: true,
      render: (rev) => {
        const t = getMemberTier(rev.user);
        return (
          <div className="flex items-center gap-2.5">
            {/* Avatar with Tier Frame Overlay */}
            <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
              <div
                className="absolute rounded-full overflow-hidden bg-[#FAF8F2] z-0 shadow-inner"
                style={{
                  top: t.avatarMetrics.top,
                  left: t.avatarMetrics.left,
                  width: t.avatarMetrics.size,
                  height: t.avatarMetrics.size,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {rev.user.avatarUrl ? (
                  <Image
                    src={rev.user.avatarUrl}
                    alt={rev.user.displayName}
                    fill
                    unoptimized
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#25384C]">
                    {rev.user.displayName?.trim().slice(0, 1).toUpperCase() || "M"}
                  </div>
                )}
              </div>

              {t.frameImage && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <Image
                    src={t.frameImage}
                    alt={t.label}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
                  />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <span
                className="font-semibold text-slate-800 text-xs truncate max-w-30 sm:max-w-40 block"
                title={rev.user.displayName}
              >
                {rev.user.displayName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "xHandle",
      header: "บัญชี X",
      sortable: true,
      className: "text-slate-600 whitespace-nowrap",
      render: (rev) => {
        const handle = rev.xHandle || rev.user.xHandle;
        return handle ? (
          <a
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-[#315F91] hover:underline font-latin inline-flex items-center gap-1 font-medium"
            title={`@${handle}`}
          >
            <span>@{handle}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        );
      },
    },
    {
      key: "createdAt",
      header: "วันที่ส่ง",
      sortable: true,
      className: "text-slate-500 whitespace-nowrap text-[11px] font-latin",
      render: (rev) => formatThaiDateTime(rev.createdAt),
    },
    {
      key: "status",
      header: "สถานะ",
      sortable: true,
      render: (rev) => (
        <div className="flex flex-col min-w-0">
          {rev.status === "PENDING" && (
            <span className="text-xs font-semibold text-[#657406]">
              รอตรวจสอบ
            </span>
          )}
          {rev.status === "APPROVED" && (
            <span className="text-xs font-semibold text-[#2D7058]">
              อนุมัติแล้ว
            </span>
          )}
          {rev.status === "REJECTED" && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#B01444]">
                ไม่อนุมัติ
              </span>
              {rev.rejectReason && (
                <span
                  className="text-[11px] text-slate-500 font-normal line-clamp-2 max-w-44 sm:max-w-64 leading-tight mt-0.5"
                  title={rev.rejectReason}
                >
                  {rev.rejectReason}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminFilterBar
        searchPlaceholder="ค้นหาชื่องานคอนเสิร์ต, ลูกค้า"
        searchQuery={reviewsSearch}
        onSearchChange={onSearchChange}
        isLoading={reviewsLoading}
        filterValue={reviewsStatus}
        onFilterChange={onStatusChange}
        filterOptions={[
          { label: "ทุกสถานะ", value: "ALL" },
          { label: "รอตรวจสอบ", value: "PENDING" },
          { label: "อนุมัติแล้ว", value: "APPROVED" },
          { label: "ปฏิเสธ", value: "REJECTED" },
        ]}
      />

      <AdminDataTable<AdminReview>
        columns={reviewColumns}
        data={reviews}
        keyExtractor={(rev) => rev.id}
        isLoading={reviewsLoading}
        emptyMessage="ไม่พบข้อมูลรีวิวตามเงื่อนไขที่เลือก"
        sortBy={reviewsSortBy}
        sortOrder={reviewsSortOrder}
        onSort={(field) =>
          onSort(field as "concertName" | "customer" | "createdAt" | "status")
        }
        page={reviewsPage}
        totalPages={reviewsTotalPages}
        totalItems={reviewsTotal}
        onPageChange={onPageChange}
        onRowClick={onOpenDetail}
        rowClassName={(rev) =>
          rev.status === "PENDING" ? "bg-[#FAF8F2]/25" : ""
        }
      />

      {/* Detail Inspection Modal */}
      <InspectReviewModal
        review={inspectingReview}
        onClose={onCloseDetail}
        isLoading={reviewActionLoading}
        onApprove={promptApproveReview}
        onReject={promptRejectReview}
      />
    </div>
  );
}

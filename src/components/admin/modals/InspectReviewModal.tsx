"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import BaseModal from "@/components/BaseModal";
import ImageLightboxModal from "@/components/ImageLightboxModal";
import { formatThaiDateTime } from "@/lib/date";
import { getMemberTier } from "@/lib/tier";
import { AdminReview } from "../types";

export interface InspectReviewModalProps {
  review: AdminReview | null;
  onClose: () => void;
  isLoading: boolean;
  onApprove: (review: AdminReview) => void;
  onReject: (review: AdminReview) => void;
}

export default function InspectReviewModal({
  review,
  onClose,
  isLoading,
  onApprove,
  onReject,
}: InspectReviewModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!review) return null;

  const t = getMemberTier(review.user);
  const rawHandle = review.xHandle || review.user.xHandle;
  const cleanHandle = rawHandle?.replace(/^@/, "").trim();

  const modalHeader = (
    <div>
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-start justify-between gap-3 bg-white shrink-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar with Tier Frame Overlay */}
          <div className="relative shrink-0 flex items-center justify-center w-11 h-11 mt-0.5">
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
              {review.user.avatarUrl ? (
                <Image
                  src={review.user.avatarUrl}
                  alt={review.user.displayName}
                  fill
                  unoptimized
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#25384C]">
                  {review.user.displayName?.trim().slice(0, 1).toUpperCase() ||
                    "M"}
                </div>
              )}
            </div>

            {t.frameImage && (
              <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                <Image
                  src={t.frameImage}
                  alt={t.label}
                  width={44}
                  height={44}
                  unoptimized
                  className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Row 1: Customer Identity (Name + @Account link + Post link) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-800 truncate">
                {review.user.displayName}
              </span>
              {cleanHandle && (
                <a
                  href={`https://x.com/${cleanHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-latin font-medium bg-[#FAF8F2] text-[#315F91] border border-[#D0DEF7] hover:bg-[#D0DEF7]/60 hover:border-[#315F91]/40 hover:text-[#25384C] transition shrink-0"
                  title={`ไปยังโปรไฟล์ @${cleanHandle} บน X`}
                >
                  <span>@{cleanHandle}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 text-[#315F91]" />
                </a>
              )}
              {review.postUrl && (
                <a
                  href={review.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF8F2] text-[#315F91] border border-[#D0DEF7] hover:bg-[#D0DEF7]/60 hover:border-[#315F91]/40 hover:text-[#25384C] transition shrink-0"
                  title="เปิดดูโพสต์หลักฐานบน X"
                >
                  <span>ดูโพสต์ใน X</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 text-[#315F91]" />
                </a>
              )}
            </div>

            {/* Row 2: Concert details, Status & Date */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mt-1">
              <span
                className="font-medium text-slate-700 truncate max-w-45 sm:max-w-60"
                title={review.concertName}
              >
                {review.concertName}
              </span>

              {review.status === "PENDING" && (
                <span className="shrink-0 text-[11px] font-semibold text-[#D97706] bg-[#D97706]/10 px-2 py-0.5 rounded-full">
                  รอตรวจสอบ
                </span>
              )}
              {review.status === "APPROVED" && (
                <span className="shrink-0 text-[11px] font-semibold text-[#2D7058] bg-[#2D7058]/10 px-2 py-0.5 rounded-full">
                  อนุมัติแล้ว
                </span>
              )}
              {review.status === "REJECTED" && (
                <span className="shrink-0 text-[11px] font-semibold text-[#B01444] bg-[#B01444]/10 px-2 py-0.5 rounded-full">
                  ไม่อนุมัติ
                </span>
              )}

              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400 font-latin shrink-0">
                {formatThaiDateTime(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const modalFooter = (
    <div className="flex items-center justify-end gap-2">
      {review.status === "PENDING" ? (
        <>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onReject(review)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#D0DEF7] text-slate-700 hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50"
          >
            ไม่อนุมัติ
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onApprove(review)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer disabled:opacity-50"
          >
            อนุมัติ
          </button>
        </>
      ) : review.status === "APPROVED" ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onReject(review)}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#D0DEF7] text-slate-700 hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50"
        >
          เปลี่ยนเป็นไม่อนุมัติ
        </button>
      ) : (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onApprove(review)}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer disabled:opacity-50"
        >
          เปลี่ยนเป็นอนุมัติ
        </button>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={!!review}
      onClose={onClose}
      header={modalHeader}
      footer={modalFooter}
      maxWidth="max-w-lg"
      closeDisabled={isLoading}
      bodyClassName="!p-0"
    >
      {/* Evidence Image or Post Link Fallback */}
      <div className="p-3 sm:p-4 bg-white space-y-3">
        {review.imageUrl ? (
          <div
            className="relative w-full aspect-4/3 max-h-[50vh] rounded-lg bg-[#FAF8F2] border border-[#D0DEF7] hover:border-[#315F91]/40 overflow-hidden flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
            title="คลิกเพื่อเปิดดูรูปขนาดเต็ม"
            onClick={() => {
              if (review.imageUrl) {
                setLightboxOpen(true);
              }
            }}
          >
            {imageLoading && (
              <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
            )}
            <Image
              key={review.imageUrl}
              src={review.imageUrl}
              alt="หลักฐานรีวิว"
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 600px"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              className={`object-contain transition-opacity duration-200 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>
        ) : review.postUrl ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              รีวิวนี้แนบเป็นลิงก์โพสต์ใน X
            </p>
            <a
              href={review.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25384C] text-white text-xs font-semibold hover:bg-[#1B2938] transition"
            >
              <span>เปิดดูโพสต์ใน X</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            ไม่พบหลักฐานรูปภาพหรือลิงก์โพสต์
          </div>
        )}

        {/* Reject reason note under the image */}
        {review.status === "REJECTED" && review.rejectReason && (
          <div className="px-3.5 py-2.5 rounded-lg bg-[#FAF8F2] border border-[#D0DEF7] text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
            <span className="font-semibold shrink-0 text-[#B01444]">
              เหตุผล:
            </span>
            <span className="wrap-break-word leading-relaxed text-slate-700 font-medium">
              {review.rejectReason}
            </span>
          </div>
        )}
      </div>

      {/* Fullscreen Image Lightbox Modal with Zoom, Pan, Rotate & Download */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        imageUrl={review.imageUrl || null}
        alt={`หลักฐานรีวิว: ${review.concertName}`}
        onClose={() => setLightboxOpen(false)}
      />
    </BaseModal>
  );
}

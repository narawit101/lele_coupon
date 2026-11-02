"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";
import BaseModal from "@/components/BaseModal";
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

  if (!review) return null;

  const t = getMemberTier(review.user);

  const modalHeader = (
    <div>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with Tier Frame Overlay */}
            <div className="relative shrink-0 flex items-center justify-center w-11 h-11">
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
                    {review.user.displayName?.trim().slice(0, 1).toUpperCase() || "M"}
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

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  {review.concertName}
                </h3>
                {review.status === "PENDING" && (
                  <span className="shrink-0 text-xs font-semibold text-[#657406]">
                    รอตรวจสอบ
                  </span>
                )}
                {review.status === "APPROVED" && (
                  <span className="shrink-0 text-xs font-semibold text-[#2D7058]">
                    อนุมัติแล้ว
                  </span>
                )}
                {review.status === "REJECTED" && (
                  <span className="shrink-0 text-xs font-semibold text-[#B01444]">
                    ไม่อนุมัติ
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                <span className="font-medium text-slate-700">
                  {review.user.displayName}
                </span>
                {(review.xHandle || review.user.xHandle) && (
                  <span className="text-slate-400 font-latin">
                    @{review.xHandle || review.user.xHandle}
                  </span>
                )}
                {review.postUrl && (
                  <>
                    <span className="text-slate-300">•</span>
                    <a
                      href={review.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#315F91] hover:underline font-medium inline-flex items-center gap-0.5"
                    >
                      <span>เปิดโพสต์ใน X</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
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
      {/* Reject reason note (if rejected) */}
      {review.status === "REJECTED" && review.rejectReason && (
        <div className="px-4 py-2.5 bg-[#FAF8F2] border-b border-[#D0DEF7]/60 text-xs text-slate-700 flex items-start gap-2 shrink-0">
          <span className="font-semibold shrink-0 text-[#B01444]">
            เหตุผล:
          </span>
          <span className="wrap-break-word leading-relaxed text-slate-700 font-medium">
            {review.rejectReason}
          </span>
        </div>
      )}
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

        {/* Evidence Image directly */}
        <div className="p-3 sm:p-4 bg-white">
          {review.imageUrl ? (
            <div
              className="relative w-full aspect-4/3 max-h-[50vh] rounded-lg bg-[#FAF8F2] border border-[#D0DEF7] overflow-hidden flex items-center justify-center shadow-2xs cursor-pointer group"
              title="คลิกเพื่อเปิดดูรูปขนาดเต็ม"
              onClick={() => {
                if (review.imageUrl) {
                  window.open(review.imageUrl, "_blank");
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
        </div>
    </BaseModal>
  );
}

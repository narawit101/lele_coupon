"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User as UserIcon, Copy, Check, X } from "lucide-react";
import { getMemberTier } from "@/lib/tier";
import { UserProfile } from "@/types/user";
import { toast } from "react-toastify";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export default function CardDetailModal({
  isOpen,
  onClose,
  user,
}: CardDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const memberTier = getMemberTier(user.tier, user.lifetimeStamps, user.stamps);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("คัดลอก Member ID เรียบร้อยแล้ว");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer z-60"
        title="ปิด"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Floating Card Container with Smooth Scale-In Animation */}
      <div
        className="w-full max-w-sm sm:max-w-md aspect-4/3 relative [perspective:1200px] cursor-pointer animate-in zoom-in-95 fade-in duration-350 ease-out"
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped((prev) => !prev);
        }}
      >
        {/* ==================== FRONT FACE (CRYSTAL CARD - NO WHITE CORNERS) ==================== */}
        <div
          className="absolute inset-0 w-full h-full bg-transparent transition-all duration-500 ease-in-out"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            opacity: isFlipped ? 0 : 1,
            pointerEvents: isFlipped ? "none" : "auto",
          }}
        >
          {/* VIP Crystal Frame - Floats purely with native PNG transparency */}
          {memberTier.cardFrameImage && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <Image
                src={memberTier.cardFrameImage}
                alt=""
                fill
                unoptimized
                priority
                style={{ objectFit: "fill" }}
                className="w-full h-full pointer-events-none select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
              />
            </div>
          )}

          {/* Decorative Brand Watermark */}
          <div className="pointer-events-none select-none absolute inset-0 bottom-6 sm:bottom-8 right-6 sm:right-8 overflow-hidden z-1">
            <div className="absolute right-0 bottom-0 w-36 h-36 sm:w-44 sm:h-44 opacity-40 sm:opacity-45 overflow-hidden rounded-full">
              <Image
                src="/icon.png"
                alt=""
                width={160}
                height={160}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Front Content */}
          <div className="relative z-10 h-full px-[9%] sm:px-[10%] pt-[24.5%] sm:pt-[25%] pb-[14%] sm:pb-[14.5%] flex flex-col justify-between">
            {/* Top Identity */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18">
                  <div
                    className="absolute rounded-full overflow-hidden bg-[#FAF8F2] z-0 shadow-inner"
                    style={{
                      top: memberTier.avatarMetrics.top,
                      left: memberTier.avatarMetrics.left,
                      width: memberTier.avatarMetrics.size,
                      height: memberTier.avatarMetrics.size,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.displayName}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="w-full h-full p-2 text-[#5284B7]" />
                    )}
                  </div>

                  {memberTier.frameImage && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                      <Image
                        src={memberTier.frameImage}
                        alt={memberTier.label}
                        width={90}
                        height={90}
                        unoptimized
                        priority
                        className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-[#25384C] leading-snug truncate max-w-30 sm:max-w-40">
                      {user.displayName}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 pl-1.5 pr-1.5 sm:pr-2 py-0.5 rounded-full text-[9.5px] sm:text-[11px] font-bold font-latin border tracking-wide uppercase shadow-2xs ${memberTier.bgColor} ${memberTier.textColor} ${memberTier.borderColor}`}
                    >
                      <span>{memberTier.label}</span>
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-[10.5px] sm:text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-400 font-medium shrink-0">
                        บัญชี X:
                      </span>
                      <span className="font-semibold text-[#25384C] truncate">
                        {user.xHandle ? `@${user.xHandle}` : "ยังไม่ได้ระบุ"}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-400 font-medium shrink-0">
                        เบอร์โทร:
                      </span>
                      <span className="font-semibold text-[#25384C] truncate">
                        {user.phone || "ยังไม่ได้ระบุ"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Points */}
            <div className="mt-auto pt-2 sm:pt-2.5 border-t border-[#25384C]/10 flex items-center justify-between pl-3.5 sm:pl-4">
              <div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                  แต้มสะสมปัจจุบัน
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-latin text-2xl sm:text-3xl font-extrabold text-[#25384C]">
                    {user.stamps.toLocaleString()}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                    แต้ม
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== BACK FACE (MATCHES FRONT CRYSTAL SILHOUETTE & BACKGROUND) ==================== */}
        <div
          className="absolute inset-0 w-full h-full bg-transparent transition-all duration-500 ease-in-out"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
            opacity: isFlipped ? 1 : 0,
            pointerEvents: isFlipped ? "auto" : "none",
          }}
        >
          {/* VIP Crystal Frame - Symmetrical Reflection of Front Face */}
          {memberTier.cardFrameImage && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <Image
                src={memberTier.cardFrameImage}
                alt=""
                fill
                unoptimized
                priority
                style={{ objectFit: "fill" }}
                className="w-full h-full pointer-events-none select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)] scale-x-[-1]"
              />
            </div>
          )}

          {/* Decorative Brand Watermark */}
          <div className="pointer-events-none select-none absolute inset-0 bottom-6 sm:bottom-8 left-6 sm:left-8 overflow-hidden z-1">
            <div className="absolute left-0 bottom-0 w-36 h-36 sm:w-44 sm:h-44 opacity-30 sm:opacity-35 overflow-hidden rounded-full">
              <Image
                src="/icon.png"
                alt=""
                width={160}
                height={160}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Back Content: Perfectly Aligned to Crystal Card Safe Area */}
          <div className="relative z-10 h-full px-[9%] sm:px-[10%] pt-[24.5%] sm:pt-[25%] pb-[14%] sm:pb-[14.5%] flex flex-col justify-between">
            {/* Top / Center: Member ID Box with Inline Copy */}
            <div className="w-full">
              <span className="text-[10px] ml-2 sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                รหัสสมาชิก
              </span>
              <div className="mt-1 flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white/75 backdrop-blur-xs border border-[#D0DEF7] shadow-2xs">
                <span className="font-mono text-xs sm:text-[13px] font-bold text-[#25384C] tracking-wide break-all select-all">
                  {user.id || "-"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="shrink-0 p-1.5 sm:p-2 rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/50 text-[#315F91] hover:text-[#25384C] border border-[#D0DEF7] transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
                  title="คัดลอกรหัสสมาชิก"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D7058]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-75" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom: Points Summary (Current & Lifetime Points) */}
            <div className="mt-auto pt-2 sm:pt-2.5 border-t border-[#25384C]/10 grid grid-cols-2 gap-2 pl-2">
              <div>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                  แต้มสะสมปัจจุบัน
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-latin text-2xl sm:text-3xl font-extrabold text-[#25384C]">
                    {user.stamps.toLocaleString()}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                    แต้ม
                  </span>
                </div>
              </div>
              <div className="border-l border-[#25384C]/10 pl-3 sm:pl-4">
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                  แต้มสะสมทั้งหมด
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-latin text-2xl sm:text-3xl font-extrabold text-[#657406]">
                    {(user.lifetimeStamps ?? user.stamps).toLocaleString()}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                    แต้ม
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

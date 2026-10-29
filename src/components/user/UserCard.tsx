"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  User as UserIcon,
  Gift,
  Ticket,
  RectangleEllipsis,
  RotateCw,
  Copy,
  Check,
} from "lucide-react";
import { getMemberTier } from "@/lib/tier";
import { UserProfile } from "@/types/user";

export interface UserCardProps {
  user: UserProfile;
  activePassCount?: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onEditProfile?: () => void;
  onExchangeReward: () => void;
  onOpenPassWallet: () => void;
  onRedeemCode: () => void;
}

export default function UserCard({
  user,
  isRefreshing,
  onRefresh,
  onExchangeReward,
  onOpenPassWallet,
  onRedeemCode,
}: UserCardProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!user.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("คัดลอก Member ID เรียบร้อยแล้ว");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const shortId =
    user.id && user.id.length > 8
      ? `#${user.id.slice(0, 4)}...${user.id.slice(-4)}`
      : `#${user.id || ""}`;

  const memberTier = getMemberTier(user.tier, user.lifetimeStamps, user.stamps);

  return (
    <div className="space-y-2.5 sm:space-y-3 w-full">
      {/* 4:3 VIP Membership Card (100% distortion-free native aspect ratio on all screen sizes) */}
      <div className="relative w-full aspect-4/3 rounded-[22px] overflow-hidden transition-all duration-300 drop-shadow-md">
        {/* VIP Card Frame & Surface */}
        {memberTier.cardFrameImage && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <Image
              src={memberTier.cardFrameImage}
              alt=""
              fill
              unoptimized
              priority
              style={{ objectFit: "fill" }}
              className="w-full h-full pointer-events-none select-none"
            />
          </div>
        )}

        {/* Decorative Brand Watermark (Strictly clipped inside the card's inner safe boundary) */}
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

        {/* Card Content: 100% Proportional Responsive Safe Area (Scales in lockstep with 4:3 frame on all screens) */}
        <div className="relative z-10 h-full px-[9%] sm:px-[10%] pt-[24.5%] sm:pt-[25%] pb-[14%] sm:pb-[14.5%] flex flex-col justify-between">
          {/* Section 1: User Profile & Identity (100% clear of top crest) */}
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
              {/* Avatar Container with Badge Overlay */}
              <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18">
                {/* Avatar Photo specifically aligned to the transparent hole of the badge */}
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

                {/* Member Tier Frame Overlay */}
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
                  {user.id && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-slate-400 font-medium shrink-0">
                        รหัสสมาชิก:
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        title="คลิกเพื่อคัดลอก Member ID"
                        className="inline-flex items-center gap-1 font-mono text-[9.5px] sm:text-[11px] font-semibold text-[#315F91] hover:text-[#25384C] bg-white/80 hover:bg-white px-1.5 py-0.5 rounded border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <span>{shortId}</span>
                        {copiedId ? (
                          <Check className="w-2.5 h-2.5 text-[#2D7058] shrink-0" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-[#5284B7] shrink-0 opacity-70" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Refresh Button: Icon-only, inside safe content */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="รีเฟรชข้อมูล"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-white/85 hover:bg-white text-[#5284B7] hover:text-[#25384C] border border-[#D0DEF7] flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 mt-1"
            >
              <RotateCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Section 2: Points Summary (Lifted safely above the bottom-left crystal cluster) */}
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

      {/* 3 Quick Action Cards: Independent 3-Card Grid directly below the 4:3 card */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
        <button
          type="button"
          onClick={onExchangeReward}
          className="w-full min-h-10 px-1 sm:px-2 py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-white hover:bg-[#FAF8F2] text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5284B7] shrink-0" />
          <span className="whitespace-nowrap truncate">แลกรางวัล</span>
        </button>

        <button
          type="button"
          onClick={onOpenPassWallet}
          className="w-full min-h-10 px-1 sm:px-2 py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-white hover:bg-[#FAF8F2] text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <Ticket className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5284B7] shrink-0" />
          <span className="whitespace-nowrap truncate">คูปองของฉัน</span>
        </button>

        <button
          type="button"
          onClick={onRedeemCode}
          className="w-full min-h-10 px-1 sm:px-2 py-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-white hover:bg-[#FAF8F2] text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <RectangleEllipsis className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5284B7] shrink-0" />
          <span className="whitespace-nowrap truncate">กรอกโค้ด</span>
        </button>
      </div>
    </div>
  );
}

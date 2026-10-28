"use client";

import Image from "next/image";
import {
  User as UserIcon,
  Gift,
  Ticket,
  RectangleEllipsis,
  RotateCw,
} from "lucide-react";
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
  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#D0DEF7] shadow-sm relative overflow-hidden">
      {/* Top Right: Refresh Button */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center z-10">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="รีเฟรชข้อมูล"
          className="text-xs text-[#25384C] hover:text-[#1B2938] font-semibold px-2.5 py-1 bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 rounded-lg border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <RotateCw
            className={`w-3 h-3 text-[#5284B7] shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "โหลด..." : "รีเฟรช"}</span>
        </button>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#D0DEF7] shadow-sm bg-[#FAF8F2] shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <UserIcon className="w-full h-full p-3 text-[#5284B7]" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-24 sm:pr-28">
          <h2 className="text-base font-bold text-[#25384C] leading-snug truncate">
            {user.displayName}
          </h2>
          <div className="mt-1 space-y-0.5 text-xs text-slate-500">
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

      {/* Points Summary */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">แต้มสะสมปัจจุบัน</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-latin text-3xl font-extrabold text-[#25384C]">
              {user.stamps}
            </span>
            <span className="text-xs font-semibold text-slate-500">แต้ม</span>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Buttons: Perfectly Responsive 3-Column Grid without Count Badge */}
      <div className="mt-3.5 grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
        <button
          type="button"
          onClick={onExchangeReward}
          className="w-full min-h-10.5 px-1.5 sm:px-2.5 py-2 text-[11px] sm:text-xs font-semibold rounded-[10px] bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <Gift className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">แลกของรางวัล</span>
        </button>

        <button
          type="button"
          onClick={onOpenPassWallet}
          className="w-full min-h-10.5 px-1.5 sm:px-2.5 py-2 text-[11px] sm:text-xs font-semibold rounded-[10px] bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <Ticket className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">คูปองของฉัน</span>
        </button>

        <button
          type="button"
          onClick={onRedeemCode}
          className="w-full min-h-10.5 px-1.5 sm:px-2.5 py-2 text-[11px] sm:text-xs font-semibold rounded-[10px] bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] transition cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5"
        >
          <RectangleEllipsis className="w-4 h-4 shrink-0" />
          <span className="truncate">กรอกโค้ด</span>
        </button>
      </div>
    </div>
  );
}

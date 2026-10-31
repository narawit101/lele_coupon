import Image from "next/image";
import { User as UserIcon, RotateCw } from "lucide-react";
import { getMemberTier, getTierProgress } from "@/lib/tier";
import { UserProfile } from "@/types/user";

export interface UserCardContentProps {
  user: UserProfile;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function UserCardContent({
  user,
  onRefresh,
  isRefreshing = false,
}: UserCardContentProps) {
  const memberTier = getMemberTier(user);
  const tierProgress = getTierProgress(user);

  return (
    <>
      {/* VIP Crystal Frame - Floats purely with native PNG transparency */}
      {memberTier.cardFrameImage && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src={memberTier.cardFrameImage}
            alt=""
            fill
            unoptimized
            priority
            style={{ objectFit: "fill", border: 0, outline: "none" }}
            className="w-full h-full pointer-events-none select-none border-0 outline-none"
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

      {/* Card Content: 100% Proportional Responsive Safe Area */}
      <div className="relative z-10 h-full px-[9%] sm:px-[10%] pt-[22%] sm:pt-[22.5%] pb-[19.5%] sm:pb-[20%] flex flex-col justify-between">
        {/* Section 1: User Profile & Identity */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            {/* Avatar Container with Tier Overlay */}
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[#25384C] leading-snug truncate max-w-44 sm:max-w-56">
                  {user.displayName}
                </h2>
              </div>

              <div className="mt-1 text-[11px] sm:text-xs text-slate-500">
                <p className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-400 font-medium shrink-0">
                    บัญชี X:
                  </span>
                  <span className="font-semibold text-[#25384C] truncate font-latin">
                    {user.xHandle ? `@${user.xHandle}` : "ยังไม่ได้ระบุ"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button (rendered only if onRefresh is provided) */}
          {onRefresh && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isRefreshing}
              title="รีเฟรชข้อมูล"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-white/85 hover:bg-white text-[#5284B7] hover:text-[#25384C] border border-[#D0DEF7] flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 mt-1"
            >
              <RotateCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Section 2: Points Summary & Minimal Tier Progress Bar */}
        <div className="mt-auto pt-2 sm:pt-2.5 border-t border-[#25384C]/10 flex flex-col gap-1.5 sm:gap-2 pl-3.5 sm:pl-4 pr-3.5 sm:pr-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                แต้มสะสมปัจจุบัน
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-latin text-2xl sm:text-3xl font-extrabold text-[#25384C] leading-none">
                  {user.stamps.toLocaleString()}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                  แต้ม
                </span>
              </div>
            </div>
          </div>

          {/* Status Text: Left: Tier Label | Right: Points/Next Tier (Moved above EXP bar for maximum legibility) */}
          <div className="flex items-center justify-between text-xs sm:text-[13px] font-medium leading-tight">
            <span className="font-bold text-[#25384C]">
              {tierProgress.currentTierLabel}
            </span>
            <span className="font-latin text-slate-600 font-bold">
              {tierProgress.isMaxTier
                ? `${tierProgress.currentPoints}/100 MAX`
                : `${tierProgress.currentPoints}/${tierProgress.nextTierMinPoints} ${tierProgress.nextTierLabel}`}
            </span>
          </div>

          {/* Minimal Progress Bar (Under Status Text) */}
          <div className="w-full bg-[#25384C]/10 h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className={`${memberTier.progressBarGradient} h-full rounded-full transition-all duration-500`}
              style={{ width: `${tierProgress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

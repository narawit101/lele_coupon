"use client";

import React from "react";
import Image from "next/image";
import { ReviewSubmission, PointLog, UserProfile } from "@/types/user";
import Pagination from "@/components/Pagination";
import { formatThaiDateTime } from "@/lib/date";
import { getMemberTier, MemberTier } from "@/lib/tier";
import { ActivityCategory } from "./hooks/useUserActivities";

export type HomeActivity =
  | { type: "REVIEW"; id: string; date: string; review: ReviewSubmission }
  | { type: "POINT_LOG"; id: string; date: string; log: PointLog };

const CATEGORIES: { id: ActivityCategory; label: string }[] = [
  { id: "ALL", label: "ทั้งหมด" },
  { id: "REVIEWS", label: "รีวิว" },
  { id: "PASSES", label: "ใช้สิทธิ์" },
  { id: "POINTS", label: "ประวัติแต้ม" },
  { id: "TIER", label: "เลื่อนขั้น" },
];

interface ActivityFeedProps {
  activities: HomeActivity[];
  activityLoading: boolean;
  isRefreshing: boolean;
  activityTotal: number;
  activityPage: number;
  activityTotalPages: number;
  selectedCategory: ActivityCategory;
  onCategoryChange: (category: ActivityCategory) => void;
  onPageChange: (newPage: number) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  currentUser?: UserProfile | null;
}

export default function ActivityFeed({
  activities,
  activityLoading,
  isRefreshing,
  activityTotal,
  activityPage,
  activityTotalPages,
  selectedCategory,
  onCategoryChange,
  onPageChange,
  containerRef,
  currentUser,
}: ActivityFeedProps) {
  return (
    <div ref={containerRef} className="pt-2 scroll-mt-20">
      <div className="flex items-center justify-between pb-2 mb-2">
        <h3 className="text-sm font-bold text-[#25384C]">ประวัติกิจกรรม</h3>
        <span className="text-[11px] font-medium text-slate-400 font-latin">
          {activityTotal} รายการ
        </span>
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-[#25384C] text-white font-semibold shadow-xs"
                  : "bg-white text-slate-600 border border-[#D0DEF7] hover:border-[#25384C]/40 hover:text-[#25384C]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* History Lists */}
      <div className="space-y-2.5">
        {isRefreshing || (activityLoading && activities.length === 0) ? (
          <div className="space-y-2.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[14px] px-3.5 py-3 border border-[#D0DEF7] shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="h-4 w-44 bg-slate-200 rounded" />
                  <div className="h-4 w-14 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 animate-in fade-in duration-200 bg-white/60 rounded-[14px] border border-dashed border-[#D0DEF7]">
            ไม่พบรายการในหมวดหมู่นี้
          </div>
        ) : (
          <div
            className={`space-y-2.5 transition-opacity duration-200 ${
              activityLoading ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {activities.map((item) => {
              if (item.type === "REVIEW") {
                const rev = item.review;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[14px] px-3.5 py-3 border border-[#D0DEF7] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#25384C] truncate">
                        ส่งรีวิว: {rev.concertName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {formatThaiDateTime(rev.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-end text-right">
                      {rev.status === "PENDING" && (
                        <span className="text-xs font-bold text-[#956018]">
                          รอตรวจสอบ
                        </span>
                      )}
                      {rev.status === "REJECTED" && (
                        <span className="text-xs font-bold text-[#B01444]">
                          ไม่อนุมัติ
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.type === "POINT_LOG") {
                const log = item.log;
                const pass = log.pass;
                const isUsed = pass?.status === "USED";
                const isTierChange = log.reason.startsWith(
                  "ปรับระดับสมาชิกเป็น",
                );
                const isAutoTier =
                  isTierChange && log.reason.includes("อัตโนมัติ");

                // Parse Tier Change Details if applicable
                let tierTitle = "";
                let tierNote: string | null = null;
                let tierConfig: ReturnType<typeof getMemberTier> | null = null;

                if (isTierChange) {
                  const noteMatch = log.reason.match(/\[หมายเหตุ:\s*(.*)\]/);
                  tierNote = noteMatch ? `หมายเหตุ: ${noteMatch[1]}` : null;

                  if (isAutoTier) {
                    const autoTierMatch = log.reason.match(
                      /อัตโนมัติ\s*\(([A-Za-z]+)\)/,
                    );
                    if (autoTierMatch) {
                      tierConfig = getMemberTier(
                        autoTierMatch[1].toUpperCase() as MemberTier,
                      );
                    } else {
                      tierConfig = getMemberTier(currentUser);
                    }
                    tierTitle = `เลื่อนขั้นอัตโนมัติ (${tierConfig.label})`;
                  } else {
                    const tierMatch = log.reason.match(
                      /ปรับระดับสมาชิกเป็น\s+([A-Za-z]+)/,
                    );
                    if (tierMatch) {
                      const rawTier = tierMatch[1].toUpperCase() as MemberTier;
                      tierConfig = getMemberTier(rawTier);
                      tierTitle = `ปรับระดับสมาชิกเป็น ${tierConfig.label}`;
                    } else {
                      tierTitle = log.reason.replace(/\s*\[หมายเหตุ:.*\]/, "");
                    }
                  }
                }

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[14px] px-3.5 py-3 border border-[#D0DEF7] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#25384C] truncate">
                        {isTierChange
                          ? tierTitle
                          : log.reason.replace(/\s*\([+-]?\d+\s*แต้ม\)$/, "")}
                      </p>
                      {isTierChange && tierNote && (
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                          {tierNote}
                        </p>
                      )}
                      {isUsed && (
                        <p className="text-xs text-[#25384C] mt-0.5 truncate">
                          <span className="text-slate-400 font-medium">
                            งานที่ใช้:
                          </span>{" "}
                          <span className="font-semibold text-[#25384C]">
                            {pass.usedForConcert || "ไม่ระบุชื่องาน"}
                          </span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {formatThaiDateTime(log.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-end text-right">
                      {isTierChange ? (
                        tierConfig?.frameImage ? (
                          <div
                            className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center"
                            title={tierConfig.label}
                          >
                            <Image
                              src={tierConfig.frameImage}
                              alt={tierConfig.label}
                              width={40}
                              height={40}
                              unoptimized
                              priority
                              className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xs"
                            />
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide shadow-2xs bg-slate-100 text-[#25384C] border-slate-300">
                            ปรับระดับ
                          </span>
                        )
                      ) : pass ||
                        log.reason.includes("สิทธิ์") ||
                        log.reason.includes("แลก") ? (
                        <span
                          className={`text-xs font-bold ${
                            isUsed || log.reason.startsWith("ใช้สิทธิ์ลัดคิว")
                              ? "text-slate-400"
                              : log.reason.startsWith("ยกเลิกการใช้สิทธิ์")
                                ? "text-slate-500"
                                : "text-[#315F91]"
                          }`}
                        >
                          {isUsed || log.reason.startsWith("ใช้สิทธิ์ลัดคิว")
                            ? "ใช้สิทธิ์แล้ว"
                            : log.reason.startsWith("ยกเลิกการใช้สิทธิ์")
                              ? "คืนสิทธิ์แล้ว"
                              : "ได้รับสิทธิ์"}
                        </span>
                      ) : (
                        <span
                          className={`text-xs sm:text-sm font-bold font-latin ${
                            log.amount > 0
                              ? "text-[#2D7058]"
                              : log.amount < 0
                                ? "text-[#B01444]"
                                : "text-slate-400"
                          }`}
                        >
                          {log.amount > 0 ? `+${log.amount}` : log.amount} แต้ม
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      {/* Common Pagination */}
      <Pagination
        page={activityPage}
        totalPages={activityTotalPages}
        totalItems={activityTotal}
        pageSize={5}
        onPageChange={onPageChange}
        compact
        className="mt-4 rounded-2xl border border-[#D0DEF7] overflow-hidden shadow-xs"
      />
    </div>
  );
}

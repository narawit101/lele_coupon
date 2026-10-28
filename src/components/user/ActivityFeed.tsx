"use client";

import React from "react";
import { ReviewSubmission, PointLog } from "@/types/user";
import Pagination from "@/components/Pagination";
import { formatThaiDateTime } from "@/lib/date";

export type HomeActivity =
  | { type: "REVIEW"; id: string; date: string; review: ReviewSubmission }
  | { type: "POINT_LOG"; id: string; date: string; log: PointLog };

interface ActivityFeedProps {
  activities: HomeActivity[];
  activityLoading: boolean;
  isRefreshing: boolean;
  activityTotal: number;
  activityPage: number;
  activityTotalPages: number;
  onPageChange: (newPage: number) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ActivityFeed({
  activities,
  activityLoading,
  isRefreshing,
  activityTotal,
  activityPage,
  activityTotalPages,
  onPageChange,
  containerRef,
}: ActivityFeedProps) {
  return (
    <div ref={containerRef} className="pt-3 scroll-mt-20">
      <div className="flex items-center justify-between pb-2 mb-1">
        <h3 className="text-sm font-bold text-[#25384C]">ประวัติกิจกรรมล่าสุด</h3>
        {activityTotal > 0 && (
          <span className="text-xs text-[#657406] font-medium font-latin">
            {activityTotal} รายการ
          </span>
        )}
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
          <div className="text-center py-8 text-xs text-slate-400 animate-in fade-in duration-200">
            ยังไม่มีประวัติกิจกรรม
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

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-[14px] px-3.5 py-3 border border-[#D0DEF7] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#25384C] truncate">
                        {log.reason.replace(/\s*\([+-]?\d+\s*แต้ม\)$/, "")}
                      </p>
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
                      {log.amount === 0 ? (
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
                              : "text-[#B01444]"
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

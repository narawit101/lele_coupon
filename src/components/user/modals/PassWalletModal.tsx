"use client";

import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { X, Copy, Check } from "lucide-react";
import { QueuePass } from "@/types/user";
import { formatThaiDateTime } from "@/lib/date";
import { siteConfig } from "@/config/site";
import Pagination from "@/components/Pagination";

export interface PassWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  passes: QueuePass[];
  total: number;
  page: number;
  totalPages: number;
  status: "ALL" | "ACTIVE" | "USED";
  counts: { all: number; active: number; used: number };
  isLoading: boolean;
  onStatusChange: (status: "ALL" | "ACTIVE" | "USED") => void;
  onPageChange: (page: number) => void;
}

export default function PassWalletModal({
  isOpen,
  onClose,
  passes,
  total,
  page,
  totalPages,
  status,
  counts,
  isLoading,
  onStatusChange,
  onPageChange,
}: PassWalletModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const passListRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("คัดลอกรหัสสิทธิ์ลัดคิวแล้ว");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChangeInternal = (newStatus: "ALL" | "ACTIVE" | "USED") => {
    onStatusChange(newStatus);
    passListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChangeInternal = (newPage: number) => {
    onPageChange(newPage);
    passListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-[#D0DEF7] max-h-[85vh] flex flex-col overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Status Filters (Pinned Top) */}
        <div className="p-5 pb-3 border-b border-[#D0DEF7] shrink-0 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-[#D0DEF7]">
            <h3 className="text-base font-bold text-[#25384C]">
              <span>คูปองรางวัล</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-[#25384C] hover:bg-[#FAF8F2] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleStatusChangeInternal("ALL")}
              className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                status === "ALL"
                  ? "bg-[#25384C] text-white shadow-2xs"
                  : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
              }`}
            >
              <span className="leading-tight">ทั้งหมด</span>
              <span
                className={`text-[11px] font-latin font-medium leading-none ${
                  status === "ALL" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                ({counts.all})
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChangeInternal("ACTIVE")}
              className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                status === "ACTIVE"
                  ? "bg-[#25384C] text-white shadow-2xs"
                  : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
              }`}
            >
              <span className="leading-tight">พร้อมใช้งาน</span>
              <span
                className={`text-[11px] font-latin font-medium leading-none ${
                  status === "ACTIVE" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                ({counts.active})
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChangeInternal("USED")}
              className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
                status === "USED"
                  ? "bg-[#25384C] text-white shadow-2xs"
                  : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
              }`}
            >
              <span className="leading-tight">ใช้งานแล้ว</span>
              <span
                className={`text-[11px] font-latin font-medium leading-none ${
                  status === "USED" ? "text-slate-300" : "text-slate-500"
                }`}
              >
                ({counts.used})
              </span>
            </button>
          </div>
        </div>

        {/* Passes Content (Scrollable Middle) */}
        <div
          ref={passListRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="flex-1 overflow-y-auto p-5 space-y-3 scroll-smooth no-scrollbar bg-[#FAF8F2]"
        >
          {isLoading && passes.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-[#D0DEF7] space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-5 w-16 bg-slate-100 rounded-md" />
                  </div>
                  <div className="py-1 space-y-1">
                    <div className="h-3 w-14 bg-slate-100 rounded-[3px]" />
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-36 bg-slate-200 rounded" />
                      <div className="h-6 w-6 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : passes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#D0DEF7] animate-in fade-in duration-200">
              <p className="text-xs text-slate-500">
                {status === "ACTIVE"
                  ? "คุณยังไม่มีสิทธิ์หรือคูปองรางวัลที่พร้อมใช้งาน"
                  : status === "USED"
                    ? "ยังไม่มีประวัติการใช้สิทธิ์"
                    : "ยังไม่มีคูปองหรือสิทธิ์รางวัลในระบบ"}
              </p>
              {status !== "USED" && (
                <p className="text-xs text-slate-400 mt-1">
                  ใช้แต้มสะสมแลกรับโปรโมชั่นเพื่อรับสิทธิ์ได้ทันที
                </p>
              )}
            </div>
          ) : (
            <div
              key={`${status}-${page}`}
              className={`space-y-3 transition-opacity duration-200 animate-in fade-in ${
                isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              {passes.map((p) => {
                const isActive = p.status === "ACTIVE";
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl transition-all space-y-3 ${
                      isActive
                        ? "bg-white border border-[#D0DEF7] shadow-2xs hover:border-[#25384C]/30"
                        : "bg-slate-50/70 border border-slate-200/80 opacity-70"
                    }`}
                  >
                    {/* Top: Title & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-bold text-sm truncate ${
                          isActive ? "text-[#25384C]" : "text-slate-500"
                        }`}
                      >
                        {p.rewardTitle || "LELE' REWARD PASS"}
                      </span>
                      {isActive ? (
                        <span className="text-xs font-semibold text-[#2D7058] shrink-0">
                          พร้อมใช้งาน
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          ใช้งานแล้ว
                        </span>
                      )}
                    </div>

                    {/* Middle: Integrated Coupon Code & Copy Action */}
                    <div className="py-0.5">
                      <span className="text-[11px] font-medium text-slate-400 block leading-tight">
                        รหัสคูปอง
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`font-mono text-base sm:text-lg font-bold tracking-wide truncate ${
                            isActive ? "text-[#25384C]" : "text-slate-400"
                          }`}
                        >
                          {p.code}
                        </span>
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleCopy(p.code)}
                            title="คัดลอกรหัส"
                            className="p-1.5 text-[#315F91] hover:text-[#25384C] hover:bg-[#D0DEF7]/40 rounded-lg border border-transparent hover:border-[#D0DEF7] transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
                          >
                            {copiedCode === p.code ? (
                              <>
                                <Check className="w-4 h-4 text-[#2D7058]" />
                                <span className="text-[11px] font-semibold text-[#2D7058]">
                                  คัดลอกแล้ว
                                </span>
                              </>
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Neutral Metadata */}
                    {isActive ? (
                      <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span>แลกเมื่อ {formatThaiDateTime(p.createdAt)}</span>
                        <a
                          href={siteConfig.shop.xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#315F91] hover:text-[#25384C] hover:underline transition"
                        >
                          แจ้งใน DM {siteConfig.shop.xDisplay}
                        </a>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/60 text-slate-500">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            งานที่ใช้สิทธิ์:
                          </span>
                          <span className="font-semibold text-[#25384C]">
                            {p.usedForConcert || "ไม่ระบุชื่องาน"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">
                            วันที่ใช้สิทธิ์:
                          </span>
                          <span className="font-medium text-slate-600">
                            {formatThaiDateTime(p.usedAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Backend Pagination (Pinned Bottom) */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-[#D0DEF7] bg-white shrink-0">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={5}
              onPageChange={handlePageChangeInternal}
              compact
              className="rounded-xl border border-[#D0DEF7] overflow-hidden shadow-2xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Copy,
  Check,
  ExternalLink,
  Gift,
  RectangleEllipsis,
} from "lucide-react";
import { QueuePass } from "@/types/user";
import { formatThaiDateTime } from "@/lib/date";
import { siteConfig } from "@/config/site";
import Pagination from "@/components/Pagination";

export interface WalletViewProps {
  passes: QueuePass[];
  total: number;
  page: number;
  totalPages: number;
  status: "ALL" | "ACTIVE" | "USED";
  counts: { all: number; active: number; used: number };
  isLoading: boolean;
  onStatusChange: (status: "ALL" | "ACTIVE" | "USED") => void;
  onPageChange: (page: number) => void;
  onExchangeReward: () => void;
  onRedeemCode: () => void;
}

export default function WalletView({
  passes,
  total,
  page,
  totalPages,
  status,
  counts,
  isLoading,
  onStatusChange,
  onPageChange,
  onExchangeReward,
  onRedeemCode,
}: WalletViewProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("คัดลอกรหัสสิทธิ์ลัดคิวแล้ว");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChangeInternal = (newStatus: "ALL" | "ACTIVE" | "USED") => {
    onStatusChange(newStatus);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChangeInternal = (newPage: number) => {
    onPageChange(newPage);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className="space-y-4 animate-in fade-in duration-150"
    >
      {/* Wallet Banner & Quick Action Header */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#D0DEF7] shadow-2xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#25384C]">
              คูปองสิทธิ์ลัดคิวของฉัน
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              แจ้งรหัสคูปองเมื่อทักจองคิวทางร้านผ่าน X:{" "}
              <a
                href={siteConfig.shop.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#315F91] hover:underline"
              >
                {siteConfig.shop.xDisplay}
              </a>
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D0DEF7]/60">
          <button
            type="button"
            onClick={onExchangeReward}
            className="min-h-10 px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 border border-[#D0DEF7] text-xs font-semibold text-[#25384C] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-[#5284B7]" />
            <span>แลกสิทธิ์</span>
          </button>
          <button
            type="button"
            onClick={onRedeemCode}
            className="min-h-10 px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 border border-[#D0DEF7] text-xs font-semibold text-[#25384C] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <RectangleEllipsis className="w-3.5 h-3.5 text-[#5284B7]" />
            <span>ใส่รหัส</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("ALL")}
          className={`flex-1 min-h-10 py-2 px-3 rounded-xl transition cursor-pointer flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            status === "ALL"
              ? "bg-[#25384C] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>ทั้งหมด</span>
          <span
            className={
              status === "ALL"
                ? "text-slate-300 font-latin"
                : "text-slate-500 font-latin"
            }
          >
            ({counts.all})
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("ACTIVE")}
          className={`flex-1 min-h-10 py-2 px-3 rounded-xl transition cursor-pointer flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            status === "ACTIVE"
              ? "bg-[#25384C] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>พร้อมใช้งาน</span>
          <span
            className={
              status === "ACTIVE"
                ? "text-slate-300 font-latin"
                : "text-slate-500 font-latin"
            }
          >
            ({counts.active})
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("USED")}
          className={`flex-1 min-h-10 py-2 px-3 rounded-xl transition cursor-pointer flex flex-col md:flex-row items-center justify-center gap-1.5 ${
            status === "USED"
              ? "bg-[#25384C] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>ใช้งานแล้ว</span>
          <span
            className={
              status === "USED"
                ? "text-slate-300 font-latin"
                : "text-slate-500 font-latin"
            }
          >
            ({counts.used})
          </span>
        </button>
      </div>

      {/* Passes List Content */}
      <div className="space-y-3">
        {isLoading && passes.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
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
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-[#D0DEF7] space-y-2 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-slate-600">
              {status === "ACTIVE"
                ? "คุณยังไม่มีสิทธิ์หรือคูปองรางวัลที่พร้อมใช้งาน"
                : status === "USED"
                  ? "ยังไม่มีประวัติการใช้สิทธิ์"
                  : "ยังไม่มีคูปองหรือสิทธิ์รางวัลในระบบ"}
            </p>
            {status !== "USED" && (
              <p className="text-xs text-slate-400">
                สะสมแต้มจากการส่งรีวิว
                หรือใช้แต้มแลกรับโปรโมชั่นเพื่อรับสิทธิ์ลัดคิว
              </p>
            )}
            {status === "ACTIVE" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExchangeReward}
                  className="px-4 py-2 rounded-xl bg-[#25384C] hover:bg-[#1B2938] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  แลกสิทธิ์ลัดคิวทันที
                </button>
              </div>
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
                          className="p-1.5 rounded-lg border border-[#D0DEF7] bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] transition cursor-pointer shrink-0 active:scale-95"
                        >
                          {copiedCode === p.code ? (
                            <Check className="w-3.5 h-3.5 text-[#2D7058]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Context details */}
                  {isActive ? (
                    <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span>แลกเมื่อ {formatThaiDateTime(p.createdAt)}</span>
                      <a
                        href={siteConfig.shop.xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#315F91] hover:text-[#25384C] hover:underline transition inline-flex items-center gap-1"
                      >
                        <span>แจ้งใน DM {siteConfig.shop.xDisplay}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs space-y-1.5 pt-2 border-t border-slate-200/60 text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">งานที่ใช้สิทธิ์:</span>
                        <span className="font-semibold text-[#25384C]">
                          {p.usedForConcert || "ไม่ระบุชื่องาน"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">วันที่ใช้สิทธิ์:</span>
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

      {/* Backend Pagination */}
      {totalPages > 1 && (
        <div className="pt-1">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={5}
            onPageChange={handlePageChangeInternal}
            compact
            className="rounded-xl border border-[#D0DEF7] bg-white overflow-hidden shadow-2xs"
          />
        </div>
      )}
    </div>
  );
}

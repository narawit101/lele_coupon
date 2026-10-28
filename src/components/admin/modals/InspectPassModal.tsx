"use client";

import React from "react";
import { formatThaiDateTime } from "@/lib/date";
import { AdminPass } from "../types";

export interface InspectPassModalProps {
  pass: AdminPass | null;
  onClose: () => void;
  isLoading: boolean;
  passConcertInput: string;
  onPassConcertInputChange: (val: string) => void;
  onPassAction: (action: "USE" | "REVERT") => Promise<void>;
}

export default function InspectPassModal({
  pass,
  onClose,
  isLoading,
  passConcertInput,
  onPassConcertInputChange,
  onPassAction,
}: InspectPassModalProps) {
  if (!pass) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-[#25384C]">
                {pass.code}
              </h3>
              <span
                className={`text-xs font-semibold ${
                  pass.status === "ACTIVE"
                    ? "text-[#657406]"
                    : "text-slate-400"
                }`}
              >
                {pass.status === "ACTIVE" ? "ยังไม่ใช้งาน" : "ใช้งานแล้ว"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pass.rewardTitle || "สิทธิ์ลัดคิว"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0 disabled:opacity-50"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Info Items */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-500">ลูกค้า</span>
            <span className="font-semibold text-slate-800 text-right">
              {pass.user.displayName}
              {pass.user.xHandle && (
                <span className="text-slate-400 font-latin font-normal ml-1.5">
                  @{pass.user.xHandle}
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-slate-500">วันที่แลกสิทธิ์</span>
            <span className="text-slate-700 font-latin text-right">
              {formatThaiDateTime(pass.createdAt)}
            </span>
          </div>
          {pass.status === "USED" && (
            <div className="flex justify-between items-baseline gap-2 pt-2 border-t border-[#D0DEF7]/40">
              <span className="text-slate-500">งานที่ใช้งาน</span>
              <span className="font-semibold text-[#25384C] text-right">
                {pass.usedForConcert || "-"}
              </span>
            </div>
          )}
        </div>

        {/* Actions Section */}
        {pass.status === "ACTIVE" ? (
          <div className="pt-2 border-t border-[#D0DEF7]/40 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1">
                งานที่ใช้งาน (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={passConcertInput}
                onChange={(e) => onPassConcertInputChange(e.target.value)}
                placeholder="เช่น คอนเสิร์ต A"
                className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onPassAction("USE")}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? "กำลังบันทึก..." : "ยืนยันการใช้สิทธิ์"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D0DEF7]/40">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onPassAction("REVERT")}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "กำลังดำเนินการ..." : "ยกเลิกสิทธิ์"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

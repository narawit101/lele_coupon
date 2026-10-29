"use client";

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";
import { AdminMember } from "../types";

export interface AdjustStampsModalProps {
  user: AdminMember | null;
  onClose: () => void;
  adjustMode: "ADD" | "DEDUCT";
  setAdjustMode: (mode: "ADD" | "DEDUCT") => void;
  adjustAmount: number;
  setAdjustAmount: React.Dispatch<React.SetStateAction<number>>;
  adjustReason: string;
  setAdjustReason: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdjustStampsModal({
  user,
  onClose,
  adjustMode,
  setAdjustMode,
  adjustAmount,
  setAdjustAmount,
  adjustReason,
  setAdjustReason,
  submitting,
  onSubmit,
}: AdjustStampsModalProps) {
  if (!user) return null;

  const isChangingStamps = adjustAmount > 0;
  const isExceeding = adjustMode === "DEDUCT" && adjustAmount > user.stamps;
  const disabled = submitting || isExceeding || !isChangingStamps;
  const submitBgColor = adjustMode === "DEDUCT" ? "#B01444" : "#2D7058";

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#25384C] truncate">
              ปรับแต้มสะสม: {user.displayName}
            </h3>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0 disabled:opacity-50"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Mode Switch (Segmented Control) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1 text-xs">
          <button
            type="button"
            onClick={() => setAdjustMode("ADD")}
            style={{
              backgroundColor: adjustMode === "ADD" ? "#2D7058" : "transparent",
              color: adjustMode === "ADD" ? "#FFFFFF" : undefined,
            }}
            className={`py-1.5 rounded-md font-semibold transition cursor-pointer text-center ${
              adjustMode === "ADD"
                ? "bg-brand-success text-white shadow-sm"
                : "text-slate-600 hover:text-[#25384C]"
            }`}
          >
            + เพิ่มแต้ม
          </button>
          <button
            type="button"
            onClick={() => setAdjustMode("DEDUCT")}
            style={{
              backgroundColor:
                adjustMode === "DEDUCT" ? "#B01444" : "transparent",
              color: adjustMode === "DEDUCT" ? "#FFFFFF" : undefined,
            }}
            className={`py-1.5 rounded-md font-semibold transition cursor-pointer text-center ${
              adjustMode === "DEDUCT"
                ? "bg-brand-error text-white shadow-sm"
                : "text-slate-600 hover:text-[#25384C]"
            }`}
          >
            - ลดแต้ม
          </button>
        </div>

        {/* Live Balance Preview Card */}
        <div className="p-3 bg-[#FAF8F2] rounded-[10px] border border-[#D0DEF7] flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">
              แต้มปัจจุบัน
            </span>
            <span className="font-bold text-[#25384C] text-sm">
              {user.stamps} แต้ม
            </span>
          </div>
          <div className="text-slate-400 font-bold text-sm">→</div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">
              แต้มหลังปรับ
            </span>
            <span
              style={{
                color:
                  adjustMode === "DEDUCT" && adjustAmount > user.stamps
                    ? "#B01444"
                    : adjustMode === "ADD"
                      ? "#2D7058"
                      : "#25384C",
              }}
              className="font-bold text-sm"
            >
              {adjustMode === "ADD"
                ? user.stamps + (adjustAmount || 0)
                : Math.max(0, user.stamps - (adjustAmount || 0))}{" "}
              แต้ม
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Amount Input with Stepper and Quick Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#25384C]">
              จำนวนแต้มที่ต้องการ{adjustMode === "ADD" ? "เพิ่ม" : "ลด"}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={adjustAmount <= 1}
                onClick={() => setAdjustAmount((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 flex items-center justify-center bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 disabled:opacity-40 text-[#25384C] border border-[#D0DEF7] rounded-lg transition cursor-pointer text-base font-bold shrink-0"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={adjustMode === "DEDUCT" ? user.stamps : undefined}
                  value={adjustAmount === 0 ? "" : adjustAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setAdjustAmount(isNaN(val) ? 0 : Math.max(0, val));
                  }}
                  className="w-full text-center font-bold text-sm py-2 px-3 border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] text-[#25384C]"
                  placeholder="1"
                />
              </div>
              <button
                type="button"
                disabled={
                  adjustMode === "DEDUCT" && adjustAmount >= user.stamps
                }
                onClick={() => setAdjustAmount((prev) => prev + 1)}
                className="w-9 h-9 flex items-center justify-center bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 disabled:opacity-40 text-[#25384C] border border-[#D0DEF7] rounded-lg transition cursor-pointer text-base font-bold shrink-0"
              >
                +
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {(adjustMode === "ADD" ? [1, 3, 5, 10] : [1, 3, 5]).map((n) => {
                const isSelected = adjustAmount === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAdjustAmount(n)}
                    style={{
                      backgroundColor: isSelected
                        ? adjustMode === "ADD"
                          ? "#2D7058"
                          : "#B01444"
                        : "#FFFFFF",
                      borderColor: isSelected
                        ? adjustMode === "ADD"
                          ? "#2D7058"
                          : "#B01444"
                        : "#D0DEF7",
                      color: isSelected ? "#FFFFFF" : "#334155",
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer hover:bg-[#FAF8F2]"
                  >
                    {adjustMode === "ADD" ? `+${n}` : `-${n}`}
                  </button>
                );
              })}
              {adjustMode === "DEDUCT" && user.stamps > 0 && (
                <button
                  type="button"
                  onClick={() => setAdjustAmount(user.stamps)}
                  style={{
                    backgroundColor:
                      adjustAmount === user.stamps ? "#B01444" : "#FFFFFF",
                    borderColor:
                      adjustAmount === user.stamps ? "#B01444" : "#D0DEF7",
                    color: adjustAmount === user.stamps ? "#FFFFFF" : "#334155",
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border transition cursor-pointer hover:bg-[#FAF8F2]"
                >
                  ลดทั้งหมด (-{user.stamps})
                </button>
              )}
            </div>

            {/* Deduction Validation Alert */}
            {adjustMode === "DEDUCT" && adjustAmount > user.stamps && (
              <p className="text-[11px] text-[#B01444] font-medium pt-1">
                ไม่สามารถลดแต้มเกินจำนวนที่ลูกค้ามีอยู่ได้ (ปัจจุบันมี{" "}
                {user.stamps} แต้ม)
              </p>
            )}
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              เหตุผล
            </label>
            <input
              type="text"
              placeholder={
                adjustMode === "ADD"
                  ? "เช่น แต้มพิเศษจากกิจกรรม, ชดเชยระบบ"
                  : "เช่น แก้ไขการบันทึกแต้มผิดพลาด"
              }
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-2 border-t border-[#D0DEF7]/40">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={disabled}
              style={{ backgroundColor: submitBgColor }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              {submitting
                ? "กำลังบันทึก..."
                : isChangingStamps
                  ? adjustMode === "ADD"
                    ? `ยืนยันเพิ่ม ${adjustAmount} แต้ม`
                    : `ยืนยันลด ${adjustAmount} แต้ม`
                  : "ระบุจำนวนแต้ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

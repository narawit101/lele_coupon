"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Coins, Crown } from "lucide-react";
import { getMemberTier, TIER_CONFIGS, MemberTier } from "@/lib/tier";
import { AdminMember } from "../types";
import AdminSelect from "../AdminSelect";

export interface ManageMemberModalProps {
  user: AdminMember | null;
  onClose: () => void;
  // Adjust Stamps props
  adjustMode: "ADD" | "DEDUCT";
  setAdjustMode: (mode: "ADD" | "DEDUCT") => void;
  adjustAmount: number;
  setAdjustAmount: React.Dispatch<React.SetStateAction<number>>;
  adjustReason: string;
  setAdjustReason: (val: string) => void;
  adjustSubmitting: boolean;
  onAdjustSubmit: (e: React.FormEvent) => void;
  // Adjust Tier props
  adjustTier: string;
  setAdjustTier: (val: string) => void;
  tierReason: string;
  setTierReason: (val: string) => void;
  tierSubmitting: boolean;
  onTierSubmit: (e: React.FormEvent) => void;
}

const TIER_OPTIONS: { value: MemberTier | "AUTO"; label: string }[] = [
  { value: "AUTO", label: "คำนวณอัตโนมัติ" },
  { value: "BRONZE", label: "Bronze" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
  { value: "DIAMOND", label: "Diamond" },
];

export default function ManageMemberModal({
  user,
  onClose,
  adjustMode,
  setAdjustMode,
  adjustAmount,
  setAdjustAmount,
  adjustReason,
  setAdjustReason,
  adjustSubmitting,
  onAdjustSubmit,
  adjustTier,
  setAdjustTier,
  tierReason,
  setTierReason,
  tierSubmitting,
  onTierSubmit,
}: ManageMemberModalProps) {
  const [activeTab, setActiveTab] = useState<"STAMPS" | "TIER">("STAMPS");

  if (!user) return null;

  const currentTier = getMemberTier(user);
  const isChangingTier = adjustTier !== (user.tier || "AUTO");
  const isChangingStamps = adjustAmount > 0;
  const isExceeding = adjustMode === "DEDUCT" && adjustAmount > user.stamps;

  const stampsDisabled = adjustSubmitting || isExceeding || !isChangingStamps;
  const tierDisabled = tierSubmitting || !isChangingTier;

  const isSubmitting = adjustSubmitting || tierSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#25384C] truncate flex items-center gap-1.5">
              <span>จัดการสมาชิก: {user.displayName}</span>
            </h3>
            {user.xHandle && (
              <p className="text-[11px] text-slate-400 font-latin mt-0.5">
                @{user.xHandle}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0 disabled:opacity-50"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher (Segmented Control on Top) */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("STAMPS")}
            className={`py-1.5 rounded-md font-semibold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === "STAMPS"
                ? "bg-white text-[#25384C] shadow-2xs"
                : "text-slate-500 hover:text-[#25384C]"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>ปรับแต้มสะสม</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TIER")}
            className={`py-1.5 rounded-md font-semibold transition cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === "TIER"
                ? "bg-white text-[#25384C] shadow-2xs"
                : "text-slate-500 hover:text-[#25384C]"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>ปรับระดับ Tier</span>
          </button>
        </div>

        {/* TAB 1: ADJUST STAMPS */}
        {activeTab === "STAMPS" && (
          <form
            onSubmit={onAdjustSubmit}
            className="space-y-3.5 animate-in fade-in duration-100"
          >
            {/* Live Balance Preview Card */}
            <div className="p-3 bg-[#FAF8F2] rounded-[10px] border border-[#D0DEF7] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">
                  แต้มปัจจุบัน
                </span>
                <span className="font-bold text-[#25384C] text-sm font-latin">
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
                  className="font-bold text-sm font-latin"
                >
                  {adjustMode === "ADD"
                    ? user.stamps + (adjustAmount || 0)
                    : Math.max(0, user.stamps - (adjustAmount || 0))}{" "}
                  แต้ม
                </span>
              </div>
            </div>

            {/* Mode Switch (Add / Deduct) */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg gap-1 text-xs">
              <button
                type="button"
                onClick={() => setAdjustMode("ADD")}
                style={{
                  backgroundColor:
                    adjustMode === "ADD" ? "#2D7058" : "transparent",
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

            {/* Stepper + Input */}
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
                จำนวนแต้มที่ต้องการ{adjustMode === "ADD" ? "เพิ่ม" : "ลด"}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={adjustAmount <= 0}
                  onClick={() =>
                    setAdjustAmount((prev) => Math.max(0, prev - 1))
                  }
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#25384C] font-bold text-lg flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 select-none"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max={adjustMode === "DEDUCT" ? user.stamps : 9999}
                  value={adjustAmount === 0 ? "" : adjustAmount}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    if (val === "") {
                      setAdjustAmount(0);
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0) {
                      setAdjustAmount(num);
                    }
                  }}
                  placeholder="0"
                  className={`w-full py-2 px-3 text-center font-bold text-base rounded-lg border outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isExceeding
                      ? "border-[#B01444] bg-rose-50 text-[#B01444] focus:ring-1 focus:ring-[#B01444]"
                      : "border-[#D0DEF7] bg-white text-[#25384C] focus:border-[#25384C]"
                  }`}
                />
                <button
                  type="button"
                  disabled={
                    adjustMode === "DEDUCT" && adjustAmount >= user.stamps
                  }
                  onClick={() => setAdjustAmount((prev) => prev + 1)}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#25384C] font-bold text-lg flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 select-none"
                >
                  +
                </button>
              </div>

              {/* Quick Add Presets */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-medium">
                  ปุ่มลัด:
                </span>
                {[1, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (adjustMode === "DEDUCT") {
                        setAdjustAmount((prev) =>
                          Math.min(user.stamps, prev + preset),
                        );
                      } else {
                        setAdjustAmount((prev) => prev + preset);
                      }
                    }}
                    className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] transition cursor-pointer active:scale-95"
                  >
                    +{preset}
                  </button>
                ))}
                {adjustAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAdjustAmount(0)}
                    className="ml-auto text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    รีเซ็ต
                  </button>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1">
                เหตุผลในการปรับแต้ม (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="เช่น กิจกรรมพิเศษ, คืนแต้ม"
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#D0DEF7] text-[#25384C] focus:border-[#25384C] outline-none transition"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={adjustSubmitting}
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white border border-[#D0DEF7] text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={stampsDisabled}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg text-white transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  adjustMode === "DEDUCT"
                    ? "bg-[#B01444] hover:bg-[#800C30]"
                    : "bg-[#2D7058] hover:bg-[#1E4D3C]"
                }`}
              >
                {adjustSubmitting
                  ? "กำลังบันทึก..."
                  : adjustMode === "ADD"
                    ? `ยืนยันเพิ่ม ${adjustAmount} แต้ม`
                    : `ยืนยันลด ${adjustAmount} แต้ม`}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADJUST TIER */}
        {activeTab === "TIER" && (
          <form
            onSubmit={onTierSubmit}
            className="space-y-3.5 animate-in fade-in duration-100"
          >
            {/* Current Tier Overview Card - Perfectly Balanced & Symmetrical */}
            <div className="p-3 bg-[#FAF8F2] rounded-[10px] border border-[#D0DEF7] flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">
                  ระดับปัจจุบัน
                </span>
                <span
                  className={`font-bold font-latin text-sm ${currentTier.textColor}`}
                >
                  {currentTier.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">
                  แต้มสะสมทั้งหมด
                </span>
                <span className="font-bold text-[#25384C] text-sm font-latin">
                  {Math.max(user.lifetimeStamps ?? 0, user.stamps)}{" "}
                  <span className="text-xs text-slate-500 font-normal">แต้ม</span>
                </span>
              </div>
            </div>

            {/* Tier Select */}
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
                เลือกระดับสมาชิกใหม่
              </label>
              <AdminSelect
                value={adjustTier}
                onChange={setAdjustTier}
                disabled={tierSubmitting}
                className="w-full"
                options={TIER_OPTIONS.map((opt) => {
                  if (opt.value === "AUTO") {
                    return {
                      value: "AUTO",
                      label: opt.label,
                      icon: (
                        <span className="w-4 h-4 rounded-full bg-[#D0DEF7]/60 text-[#315F91] text-[9px] font-bold flex items-center justify-center shrink-0">
                          A
                        </span>
                      ),
                    };
                  }
                  const config = TIER_CONFIGS[opt.value];
                  return {
                    value: opt.value,
                    label: opt.label,
                    icon: (
                      <span className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                        <Image
                          src={config.badgeImage}
                          alt=""
                          width={16}
                          height={16}
                          unoptimized
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                      </span>
                    ),
                  };
                })}
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1">
                เหตุผลในการปรับระดับ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={tierReason}
                onChange={(e) => setTierReason(e.target.value)}
                placeholder="เช่น เลื่อนระดับพิเศษ VIP, ปรับตามยอด"
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#D0DEF7] text-[#25384C] focus:border-[#25384C] outline-none transition"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={tierSubmitting}
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white border border-[#D0DEF7] text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={tierDisabled}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tierSubmitting ? "กำลังบันทึก..." : "บันทึกระดับสมาชิก"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

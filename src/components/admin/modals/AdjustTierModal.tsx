"use client";

import React from "react";
import Image from "next/image";
import { getMemberTier, TIER_CONFIGS, MemberTier } from "@/lib/tier";
import { AdminMember } from "../types";
import AdminSelect from "../AdminSelect";

export interface AdjustTierModalProps {
  user: AdminMember | null;
  onClose: () => void;
  adjustTier: string;
  setAdjustTier: (val: string) => void;
  adjustReason: string;
  setAdjustReason: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const TIER_OPTIONS: { value: MemberTier | "AUTO"; label: string }[] = [
  { value: "AUTO", label: "อัตโนมัติ (คำนวณตามแต้มสะสม)" },
  { value: "BRONZE", label: "Bronze (0+ แต้ม)" },
  { value: "SILVER", label: "Silver (10+ แต้ม)" },
  { value: "GOLD", label: "Gold (25+ แต้ม)" },
  { value: "PLATINUM", label: "Platinum (50+ แต้ม)" },
  { value: "DIAMOND", label: "Diamond (100+ แต้ม)" },
];

export default function AdjustTierModal({
  user,
  onClose,
  adjustTier,
  setAdjustTier,
  adjustReason,
  setAdjustReason,
  submitting,
  onSubmit,
}: AdjustTierModalProps) {
  if (!user) return null;

  const currentTier = getMemberTier(
    user.tier,
    user.lifetimeStamps,
    user.stamps,
  );
  const isAutoMode = !user.tier || user.tier === "AUTO";
  const isChangingTier = adjustTier !== (user.tier || "AUTO");
  const disabled = submitting || !isChangingTier;

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
              กำหนดระดับสมาชิก: {user.displayName}
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

        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Current Tier Overview Card */}
          <div className="p-3 bg-[#FAF8F2] rounded-[10px] border border-[#D0DEF7] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentTier.badgeImage && (
                <span className="relative w-5 h-5 shrink-0 flex items-center justify-center">
                  <Image
                    src={currentTier.badgeImage}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                </span>
              )}
              <div className="min-w-0">
                <span className="text-slate-400 block text-[10px] font-medium leading-tight">
                  ระดับปัจจุบัน
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-bold font-latin text-xs ${currentTier.textColor}`}
                  >
                    {currentTier.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isAutoMode ? "(อัตโนมัติ)" : "(กำหนดเอง)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-slate-400 block text-[10px] leading-tight">
                แต้มปัจจุบัน:{" "}
                <strong className="text-[#25384C] font-semibold">
                  {user.stamps}
                </strong>{" "}
                แต้ม
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                สะสมทั้งหมด:{" "}
                <strong className="text-[#25384C] font-semibold font-latin">
                  {Math.max(user.lifetimeStamps ?? 0, user.stamps)}
                </strong>{" "}
                แต้ม
              </span>
            </div>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
              เลือกระดับสมาชิก
            </label>
            <AdminSelect
              value={adjustTier}
              onChange={(val) => setAdjustTier(val)}
              disabled={submitting}
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

          {/* Reason Field (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              หมายเหตุ
            </label>
            <input
              type="text"
              placeholder="ระบุเหตุผลในการปรับระดับ (ถ้ามี)"
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
              className="flex-1 py-2 text-xs font-semibold rounded-lg text-white bg-[#25384C] hover:bg-[#1B2938] shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "กำลังบันทึก..." : "บันทึกระดับสมาชิก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

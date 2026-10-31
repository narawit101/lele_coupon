"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import { AdminSpecialCode } from "../types";
import { generateSpecialCode } from "../hooks/useAdminPromotions";

export interface SpecialCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCode: AdminSpecialCode | null;
  codeName: string;
  setCodeName: (val: string) => void;
  rewardType: "PASS" | "POINTS";
  setRewardType: (val: "PASS" | "POINTS") => void;
  rewardPoints: string;
  setRewardPoints: (val: string) => void;
  rewardTitle: string;
  setRewardTitle: (val: string) => void;
  maxUses: string;
  setMaxUses: (val: string) => void;
  expiresAt: string;
  setExpiresAt: (val: string) => void;
  codeActive: boolean;
  setCodeActive: React.Dispatch<React.SetStateAction<boolean>>;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (code: AdminSpecialCode) => void;
  currentTime?: number;
}

export default function SpecialCodeModal({
  isOpen,
  onClose,
  editingCode,
  codeName,
  setCodeName,
  rewardType,
  setRewardType,
  rewardPoints,
  setRewardPoints,
  rewardTitle,
  setRewardTitle,
  maxUses,
  setMaxUses,
  expiresAt,
  setExpiresAt,
  codeActive,
  setCodeActive,
  saving,
  onSubmit,
  onDelete,
  currentTime,
}: SpecialCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!codeName) return;
    navigator.clipboard.writeText(codeName);
    setCopied(true);
    toast.success(`คัดลอกรหัส ${codeName} แล้ว`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#25384C]">
              {editingCode ? "แก้ไขรหัสโค้ดพิเศษ" : "สร้างรหัสโค้ดพิเศษใหม่"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingCode
                ? "ปรับปรุงข้อมูล โควต้า วันหมดอายุ หรือสถานะของโค้ด"
                : "กำหนดสิทธิ์ วันหมดอายุ และโควต้าการใช้งาน"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          {/* Code Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-[#25384C]">
                รหัสโค้ด <span className="text-[#B01444]">*</span>
              </label>
              {!editingCode && (
                <button
                  type="button"
                  onClick={() => setCodeName(generateSpecialCode())}
                  className="text-[11px] text-[#5284B7] hover:underline cursor-pointer"
                >
                  สุ่มรหัสอัตโนมัติ
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                autoComplete="off"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                placeholder="เช่น LELEXMAS, VIP2026"
                className="flex-1 min-w-0 px-3 py-2 border border-[#D0DEF7] rounded-[10px] bg-white font-mono font-bold tracking-wider uppercase text-sm outline-none focus:border-[#25384C]"
              />
              {codeName && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-[10px] border border-[#D0DEF7] bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
                  title="คัดลอกรหัสโค้ด"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2D7058]" />
                      <span className="text-[#2D7058]">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#5284B7]" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Reward Type */}
          <div>
            <label className="block font-semibold text-[#25384C] mb-1.5">
              ประเภทรางวัล <span className="text-[#B01444]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRewardType("PASS");
                  if (rewardTitle === "แต้มสะสมพิเศษ" || !rewardTitle) {
                    setRewardTitle("ของรางวัลพิเศษ");
                  }
                }}
                className={`py-2 px-3 rounded-[10px] font-semibold text-center transition cursor-pointer ${
                  rewardType === "PASS"
                    ? "bg-[#25384C] text-white"
                    : "bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7]"
                }`}
              >
                อื่นๆ
              </button>
              <button
                type="button"
                onClick={() => {
                  setRewardType("POINTS");
                  if (
                    rewardTitle === "ของรางวัลพิเศษ" ||
                    rewardTitle === "สิทธิ์ลัดคิว 1 งาน" ||
                    !rewardTitle
                  ) {
                    setRewardTitle("แต้มสะสมพิเศษ");
                  }
                }}
                className={`py-2 px-3 rounded-[10px] font-semibold text-center transition cursor-pointer ${
                  rewardType === "POINTS"
                    ? "bg-[#25384C] text-white"
                    : "bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7]"
                }`}
              >
                เพิ่มแต้ม
              </button>
            </div>
          </div>

          {/* Points Input */}
          {rewardType === "POINTS" && (
            <div>
              <label className="block font-semibold text-[#25384C] mb-1">
                จำนวนแต้มสะสมที่มอบให้ <span className="text-[#B01444]">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={rewardPoints}
                onChange={(e) => setRewardPoints(e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DEF7] rounded-[10px] bg-white outline-none focus:border-[#25384C] font-latin"
              />
            </div>
          )}

          {/* Reward Title */}
          <div>
            <label className="block font-semibold text-[#25384C] mb-1">
              ชื่อของรางวัลที่แสดง <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="เช่น ของรางวัลพิเศษ, คูปองส่วนลด 50 บาท"
              className="w-full px-3 py-2 border border-[#D0DEF7] rounded-[10px] bg-white outline-none focus:border-[#25384C]"
            />
          </div>

          {/* Quota & Expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#25384C] mb-1">
                โควต้าจำนวนสิทธิ์
              </label>
              <input
                type="number"
                min="1"
                placeholder="ไม่ระบุ = ไม่จำกัด"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DEF7] rounded-[10px] bg-white outline-none focus:border-[#25384C] font-latin"
              />
              {editingCode && (
                <p className="text-[11px] text-slate-400 mt-1 font-latin">
                  ใช้ไปแล้ว: {editingCode.usedCount} ครั้ง
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#25384C] mb-1">
                วันหมดอายุ
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DEF7] rounded-[10px] bg-white outline-none focus:border-[#25384C] font-latin text-xs"
              />
            </div>
          </div>

          {/* Status Toggle (Only when editing) */}
          {editingCode &&
            (() => {
              const isExpired =
                Boolean(currentTime && editingCode.expiresAt) &&
                new Date(editingCode.expiresAt!).getTime() < (currentTime ?? 0);

              return (
                <div className="pt-2 pb-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#25384C]">
                      สถานะโค้ด
                    </label>
                    {isExpired && (
                      <span className="text-[11px] font-bold text-[#B01444] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        หมดอายุแล้ว
                      </span>
                    )}
                  </div>
                  <div
                    onClick={() => setCodeActive((prev) => !prev)}
                    className="flex items-center gap-3 cursor-pointer select-none group"
                  >
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        backgroundColor: codeActive ? "#25384C" : "#CBD5E1",
                        transition:
                          "background-color 0.25s ease, border-color 0.25s ease",
                      }}
                      className={`rounded-full p-0.5 flex items-center shrink-0 border ${
                        codeActive ? "border-[#25384C]" : "border-slate-300"
                      }`}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          transform: codeActive
                            ? "translateX(20px)"
                            : "translateX(0px)",
                          transition:
                            "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        className="bg-white rounded-full shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-bold transition-colors ${
                          codeActive ? "text-[#2D7058]" : "text-slate-600"
                        }`}
                      >
                        {codeActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isExpired
                          ? "โค้ดหมดอายุตามวันที่กำหนดแล้ว (สามารถแก้ไขหรือขยายวันหมดอายุได้)"
                          : codeActive
                            ? "ลูกค้าสามารถนำรหัสนี้ไปกดแลกรับของรางวัลได้"
                            : "ระงับการใช้งานชั่วคราว ลูกค้าจะไม่สามารถกดแลกได้"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D0DEF7]/40">
            {editingCode && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  const target = editingCode;
                  onClose();
                  onDelete(target);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 transition cursor-pointer"
              >
                ลบโค้ด
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] disabled:opacity-50 transition cursor-pointer"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : editingCode
                    ? "บันทึกการแก้ไข"
                    : "สร้างโค้ดพิเศษ"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

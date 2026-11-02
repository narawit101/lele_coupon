"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";
import { AdminPromotion } from "../types";

export interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPromo: AdminPromotion | null;
  promoTitle: string;
  setPromoTitle: (val: string) => void;
  promoPoints: string;
  setPromoPoints: (val: string) => void;
  promoDesc: string;
  setPromoDesc: (val: string) => void;
  promoQuota: string;
  setPromoQuota: (val: string) => void;
  promoMaxPerUser: string;
  setPromoMaxPerUser: (val: string) => void;
  promoExpiresAt: string;
  setPromoExpiresAt: (val: string) => void;
  promoActive: boolean;
  setPromoActive: React.Dispatch<React.SetStateAction<boolean>>;
  savingPromo: boolean;
  onSave: (e: React.FormEvent) => void;
  onDelete: (id: string, title: string) => void;
}

export default function PromoModal({
  isOpen,
  onClose,
  editingPromo,
  promoTitle,
  setPromoTitle,
  promoPoints,
  setPromoPoints,
  promoDesc,
  setPromoDesc,
  promoQuota,
  setPromoQuota,
  promoMaxPerUser,
  setPromoMaxPerUser,
  promoExpiresAt,
  setPromoExpiresAt,
  promoActive,
  setPromoActive,
  savingPromo,
  onSave,
  onDelete,
}: PromoModalProps) {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPromo ? "แก้ไขโปรโมชั่น" : "สร้างโปรโมชั่นใหม่"}
      subtitle="กำหนดชื่อและจำนวนแต้มที่ลูกค้าต้องใช้ในการแลก"
      maxWidth="max-w-md"
      closeDisabled={savingPromo}
      bodyClassName="space-y-4 pt-4"
    >

        <form onSubmit={onSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              ชื่อโปรโมชั่น / ของรางวัล{" "}
              <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น สิทธิ์ลัดคิว 1 งาน, ส่วนลด 50 บาท"
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              จำนวนแต้มที่ใช้แลก <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="5"
              value={promoPoints}
              onChange={(e) => setPromoPoints(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              รายละเอียด / เงื่อนไขการใช้งาน
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ใช้ได้กับคอนเสิร์ตทุกงาน แจ้งทาง DM ก่อนวันกดบัตร 1 วัน"
              value={promoDesc}
              onChange={(e) => setPromoDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>

          {/* Quotas & User Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1">
                จำนวนสิทธิ์รวมทั้งหมด
              </label>
              <input
                type="number"
                min="1"
                placeholder="เว้นว่าง = ไม่จำกัด"
                value={promoQuota}
                onChange={(e) => setPromoQuota(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] font-latin transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#25384C] mb-1">
                จำกัดสิทธิ์ต่อคน (สิทธิ์/คน)
              </label>
              <input
                type="number"
                min="1"
                placeholder="เว้นว่าง = ไม่จำกัด"
                value={promoMaxPerUser}
                onChange={(e) => setPromoMaxPerUser(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] font-latin transition"
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              วันหมดอายุโปรโมชั่น (ถ้ามี)
            </label>
            <input
              type="datetime-local"
              value={promoExpiresAt}
              onChange={(e) => setPromoExpiresAt(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] font-latin transition"
            />
          </div>

          <div className="pt-1 pb-1">
            <label className="text-xs font-semibold text-[#25384C] block mb-1.5">
              สถานะโปรโมชั่น
            </label>
            <div
              onClick={() => setPromoActive((prev) => !prev)}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              {/* Sliding Toggle Pill */}
              <div
                style={{
                  width: 44,
                  height: 24,
                  backgroundColor: promoActive ? "#25384C" : "#CBD5E1",
                  transition:
                    "background-color 0.25s ease, border-color 0.25s ease",
                }}
                className={`rounded-full p-0.5 flex items-center shrink-0 border ${
                  promoActive ? "border-[#25384C]" : "border-slate-300"
                }`}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    transform: promoActive
                      ? "translateX(20px)"
                      : "translateX(0px)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  className="bg-white rounded-full shadow-sm"
                />
              </div>

              {/* Dynamic Status Text */}
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-xs font-bold transition-colors ${
                    promoActive ? "text-[#2D7058]" : "text-slate-600"
                  }`}
                >
                  {promoActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {promoActive
                    ? "ลูกค้าสามารถมองเห็นและใช้แต้มแลกได้ทันที"
                    : "ลูกค้าจะไม่สามารถกดแลกโปรโมชั่นนี้ได้"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D0DEF7]/40">
            {editingPromo ? (
              <button
                type="button"
                onClick={() => {
                  const id = editingPromo.id;
                  const title = editingPromo.title;
                  onClose();
                  onDelete(id, title);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 transition cursor-pointer"
              >
                ลบโปรโมชั่น
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
                disabled={savingPromo}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] disabled:opacity-50 transition cursor-pointer"
              >
                {savingPromo ? "กำลังบันทึก..." : "บันทึกโปรโมชั่น"}
              </button>
            </div>
          </div>
        </form>
    </BaseModal>
  );
}

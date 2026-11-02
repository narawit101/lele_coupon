"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";
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

  const modalHeader = (
    <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-3 sm:pb-4 border-b border-[#D0DEF7]/60 shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-mono text-[#25384C]">
            {pass.code}
          </h3>
          <span
            className={`text-xs font-semibold ${
              pass.status === "ACTIVE" ? "text-[#657406]" : "text-slate-400"
            }`}
          >
            {pass.status === "ACTIVE" ? "รอยืนยันสิทธิ์" : "ใช้งานแล้ว"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {pass.rewardTitle || "สิทธิ์ลัดคิว"}
          {pass.promotion?.points !== undefined &&
            pass.promotion?.points !== null && (
              <span className="text-slate-400 font-latin ml-1">
                (ใช้ {pass.promotion.points} แต้ม)
              </span>
            )}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="text-[#5284B7] hover:text-[#25384C] p-1 rounded-full hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50 shrink-0"
        title="ปิด"
      >
        ✕
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={!!pass}
      onClose={onClose}
      header={modalHeader}
      maxWidth="max-w-md"
      closeDisabled={isLoading}
      bodyClassName="space-y-4 pt-4"
    >
      {/* Pass Details */}
      <div className="p-3 rounded-lg bg-[#FAF8F2] border border-[#D0DEF7] space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">เจ้าของสิทธิ์:</span>
          <span className="font-semibold text-slate-700">
            {pass.user?.displayName || "ไม่ระบุ"}
          </span>
        </div>
        {pass.user?.xHandle && (
          <div className="flex justify-between">
            <span className="text-slate-500">บัญชี X:</span>
            <span className="font-medium text-slate-600 font-latin">
              @{pass.user.xHandle}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">วันที่แลก:</span>
          <span className="font-medium text-slate-600 font-latin">
            {formatThaiDateTime(pass.createdAt)}
          </span>
        </div>
        {pass.status === "USED" && pass.usedAt && (
          <div className="flex justify-between border-t border-[#D0DEF7]/60 pt-1.5 mt-1.5">
            <span className="text-slate-500">ใช้งานเมื่อ:</span>
            <span className="font-medium text-slate-600 font-latin">
              {formatThaiDateTime(pass.usedAt)}
            </span>
          </div>
        )}
        {pass.usedForConcert && (
          <div className="flex justify-between">
            <span className="text-slate-500">ชื่องานคอนเสิร์ต:</span>
            <span className="font-semibold text-[#25384C]">
              {pass.usedForConcert}
            </span>
          </div>
        )}
      </div>

      {/* Action Form */}
      {pass.status === "ACTIVE" ? (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่องานคอนเสิร์ตที่นำไปใช้
            </label>
            <input
              type="text"
              placeholder="เช่น IU H.E.R. World Tour in Bangkok"
              value={passConcertInput}
              onChange={(e) => onPassConcertInputChange(e.target.value)}
              className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#D0DEF7] text-slate-700 hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50"
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
        <div className="flex items-center justify-end pt-3 border-t border-[#D0DEF7]/40">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onPassAction("REVERT")}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "กำลังดำเนินการ..." : "ยกเลิกสิทธิ์"}
          </button>
        </div>
      )}
    </BaseModal>
  );
}

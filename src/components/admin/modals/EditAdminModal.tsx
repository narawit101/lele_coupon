"use client";

import React from "react";
import { AdminProfile, AdminMember } from "../types";

export interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAdmin: AdminMember | null;
  adminProfile: AdminProfile | null;
  adminName: string;
  setAdminName: (val: string) => void;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
}

export default function EditAdminModal({
  isOpen,
  onClose,
  editingAdmin,
  adminProfile,
  adminName,
  setAdminName,
  saving,
  onSave,
}: EditAdminModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#25384C]">
              แก้ไขชื่อแอดมิน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingAdmin?.id === adminProfile?.id
                ? "แก้ไขชื่อโปรไฟล์ของคุณในระบบ"
                : "แก้ไขชื่อของบัญชีแอดมิน"}
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0 disabled:opacity-50"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} autoComplete="off" className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              ชื่อ <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="เช่น แอดมินร้านเลอเล่อ"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition font-semibold text-[#25384C]"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#D0DEF7]/40">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving || !adminName.trim()}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกชื่อ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

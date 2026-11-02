"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";
import { AdminProfile, AdminMember } from "../types";

export interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAdmin: AdminMember | null;
  adminProfile: AdminProfile | null;
  adminName: string;
  setAdminName: (val: string) => void;
  adminEmail: string;
  setAdminEmail: (val: string) => void;
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
  adminEmail,
  setAdminEmail,
  saving,
  onSave,
}: EditAdminModalProps) {
  if (!isOpen) return null;

  const isDev = adminProfile?.role === "DEV";
  const isSelf = editingAdmin?.id === adminProfile?.id;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isSelf ? "แก้ไขข้อมูลโปรไฟล์ของคุณ" : "แก้ไขข้อมูลบัญชีแอดมิน"}
      subtitle={
        isSelf
          ? "แก้ไขชื่อและอีเมลล็อกอินของคุณในระบบ"
          : "แก้ไขชื่อและข้อมูลบัญชีของแอดมิน"
      }
      maxWidth="max-w-sm"
      closeDisabled={saving}
      bodyClassName="space-y-4 pt-4"
    >
      <form onSubmit={onSave} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อที่ใช้แสดง
          </label>
          <input
            type="text"
            required
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
          />
        </div>

        {isDev ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อีเมลล็อกอิน (DEV สิทธิ์แก้ไขได้)
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              อีเมลล็อกอิน (ไม่สามารถแก้ไขได้)
            </label>
            <input
              type="email"
              disabled
              value={editingAdmin?.email || ""}
              className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            />
          </div>
        )}

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
            disabled={
              saving || !adminName.trim() || (isDev && !adminEmail.trim())
            }
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

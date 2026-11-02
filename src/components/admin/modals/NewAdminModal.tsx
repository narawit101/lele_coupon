"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";
import PasswordCriteriaChecklist from "../PasswordCriteriaChecklist";

export interface NewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  setEmail: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  passwordMode: "DEFAULT" | "CUSTOM";
  setPasswordMode: (mode: "DEFAULT" | "CUSTOM") => void;
  password: string;
  setPassword: (val: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function NewAdminModal({
  isOpen,
  onClose,
  email,
  setEmail,
  name,
  setName,
  passwordMode,
  setPasswordMode,
  password,
  setPassword,
  saving,
  onSubmit,
}: NewAdminModalProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="เพิ่มบัญชีแอดมินใหม่"
      subtitle="สร้างบัญชีผู้ดูแลระบบสำหรับจัดการร้าน"
      maxWidth="max-w-sm"
      closeDisabled={saving}
      bodyClassName="space-y-4 pt-4"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            อีเมล
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ชื่อที่ใช้แสดง
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-13 px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            รหัสผ่าน
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setPasswordMode("DEFAULT")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                passwordMode === "DEFAULT"
                  ? "bg-[#25384C] text-white border-[#25384C]"
                  : "bg-white text-slate-600 border-[#D0DEF7] hover:bg-[#FAF8F2]"
              }`}
            >
              ค่าเริ่มต้น (Admin@1234)
            </button>
            <button
              type="button"
              onClick={() => setPasswordMode("CUSTOM")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                passwordMode === "CUSTOM"
                  ? "bg-[#25384C] text-white border-[#25384C]"
                  : "bg-white text-slate-600 border-[#D0DEF7] hover:bg-[#FAF8F2]"
              }`}
            >
              กำหนดเอง
            </button>
          </div>

          {passwordMode === "CUSTOM" && (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านอย่างน้อย 8 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-13 px-3 py-2 pr-12 text-xs rounded-lg border border-[#D0DEF7] outline-none focus:border-[#25384C] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#25384C] text-xs font-medium transition cursor-pointer select-none"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              <PasswordCriteriaChecklist password={password} alwaysShow />
            </div>
          )}
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
            disabled={saving}
            className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer"
          >
            {saving ? "กำลังสร้าง..." : "สร้างบัญชี"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

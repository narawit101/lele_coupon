"use client";

import React from "react";
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
              เพิ่มบัญชีแอดมินใหม่
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              สร้างบัญชีผู้ดูแลระบบสำหรับจัดการร้าน
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

        <form onSubmit={onSubmit} autoComplete="off" className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              อีเมลแอดมิน <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              placeholder="เช่น admin.lele@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              ชื่อแอดมิน <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="เช่น แอดมินร้านเลอเล่อ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
              การตั้งรหัสผ่าน
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAF8F2] rounded-lg border border-[#D0DEF7] text-xs font-semibold mb-2">
              <button
                type="button"
                onClick={() => setPasswordMode("DEFAULT")}
                className={`py-1.5 rounded-md transition cursor-pointer text-center ${
                  passwordMode === "DEFAULT"
                    ? "bg-[#25384C] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#25384C]"
                }`}
              >
                ใช้รหัสเริ่มต้น
              </button>
              <button
                type="button"
                onClick={() => setPasswordMode("CUSTOM")}
                className={`py-1.5 rounded-md transition cursor-pointer text-center ${
                  passwordMode === "CUSTOM"
                    ? "bg-[#25384C] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#25384C]"
                }`}
              >
                กำหนดรหัสผ่านเอง
              </button>
            </div>

            {passwordMode === "DEFAULT" ? (
              <div className="w-full px-3 py-2 text-xs font-mono font-bold border border-[#D0DEF7] rounded-lg bg-[#FAF8F2] text-slate-600 flex items-center justify-between select-all">
                <span>lele@coupon1234</span>
                <span className="text-[10px] font-sans font-normal text-slate-400">
                  (บังคับเปลี่ยนเมื่อล็อกอิน)
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={passwordMode === "CUSTOM"}
                    autoComplete="new-password"
                    placeholder="ขั้นต่ำ 8 ตัวอักษร (มีตัวเลขและตัวอักษร)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-12 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition font-mono"
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
      </div>
    </div>
  );
}

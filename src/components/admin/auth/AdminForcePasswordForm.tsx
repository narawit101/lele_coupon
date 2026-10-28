"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { AdminProfile } from "../types";
import PasswordCriteriaChecklist from "../PasswordCriteriaChecklist";

export interface AdminForcePasswordFormProps {
  adminProfile: AdminProfile;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showForcedNewPassword: boolean;
  setShowForcedNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showForcedConfirmPassword: boolean;
  setShowForcedConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  passwordError: string;
  savingPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminForcePasswordForm({
  adminProfile,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showForcedNewPassword,
  setShowForcedNewPassword,
  showForcedConfirmPassword,
  setShowForcedConfirmPassword,
  passwordError,
  savingPassword,
  onSubmit,
}: AdminForcePasswordFormProps) {
  const isLenValid = newPassword.length >= 8;
  const isAlphaValid = /[A-Za-z]/.test(newPassword);
  const isNumValid = /[0-9]/.test(newPassword);
  const isNewPasswordReady =
    isLenValid &&
    isAlphaValid &&
    isNumValid &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F2] text-[#25384C]">
      <div className="w-full max-w-md bg-white rounded-[20px] p-6 sm:p-7 border border-[#D0DEF7] shadow-[0_16px_48px_rgba(37,56,76,0.08)] relative overflow-hidden">
        <h2 className="text-lg font-bold text-center text-[#25384C]">
          จำเป็นต้องตั้งรหัสผ่านใหม่
        </h2>
        <p className="text-xs text-center text-[#657406] mt-1 leading-relaxed">
          ยินดีต้อนรับคุณ <b className="text-[#25384C]">{adminProfile.name}</b> ({adminProfile.email})
          <br />
          กรุณาตั้งรหัสผ่านใหม่ก่อนเริ่มใช้งาน
        </p>

        <form onSubmit={onSubmit} autoComplete="off" className="mt-6 space-y-4">
          <input
            type="text"
            name="prevent_autofill_username"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                type={showForcedNewPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="กำหนดรหัสผ่านใหม่"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full min-h-12 pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#D0DEF7] text-sm text-[#25384C] focus:border-[#25384C] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowForcedNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#25384C] transition cursor-pointer p-0.5"
                title={showForcedNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showForcedNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              ยืนยันรหัสผ่านใหม่อีกครั้ง
            </label>
            <div className="relative">
              <input
                type={showForcedConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full min-h-12 pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-[#D0DEF7] text-sm text-[#25384C] focus:border-[#25384C] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowForcedConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#25384C] transition cursor-pointer p-0.5"
                title={showForcedConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showForcedConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Live Security Checklist */}
          <PasswordCriteriaChecklist
            password={newPassword}
            confirmPassword={confirmPassword}
            alwaysShow
          />

          {passwordError && (
            <p className="text-xs text-[#B01444] bg-[#FBEDED] border border-[#B01444]/20 p-2.5 rounded-lg text-center font-medium">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={!isNewPasswordReady || savingPassword}
            className="w-full min-h-12 py-3 bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            {savingPassword ? "กำลังบันทึก..." : "ยืนยันและเริ่มใช้งาน"}
          </button>
        </form>
      </div>
    </main>
  );
}

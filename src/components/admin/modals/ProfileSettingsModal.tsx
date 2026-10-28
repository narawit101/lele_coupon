"use client";

import React from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { AdminProfile } from "../types";
import PasswordCriteriaChecklist from "../PasswordCriteriaChecklist";

export interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminProfile: AdminProfile | null;
  uploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profileNameInput: string;
  setProfileNameInput: (val: string) => void;
  profileNewPassword: string;
  setProfileNewPassword: (val: string) => void;
  profileConfirmPassword: string;
  setProfileConfirmPassword: (val: string) => void;
  showProfileNewPassword: boolean;
  setShowProfileNewPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showProfileConfirmPassword: boolean;
  setShowProfileConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  profilePasswordError: string;
  setProfilePasswordError: (val: string) => void;
  savingProfile: boolean;
  onSave: (e: React.FormEvent) => void;
}

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  adminProfile,
  uploadingAvatar,
  onAvatarUpload,
  profileNameInput,
  setProfileNameInput,
  profileNewPassword,
  setProfileNewPassword,
  profileConfirmPassword,
  setProfileConfirmPassword,
  showProfileNewPassword,
  setShowProfileNewPassword,
  showProfileConfirmPassword,
  setShowProfileConfirmPassword,
  profilePasswordError,
  setProfilePasswordError,
  savingProfile,
  onSave,
}: ProfileSettingsModalProps) {
  if (!isOpen) return null;

  const isProfilePassLenValid = profileNewPassword.length >= 8;
  const isProfilePassAlphaValid = /[A-Za-z]/.test(profileNewPassword);
  const isProfilePassNumValid = /[0-9]/.test(profileNewPassword);
  const isProfilePassReady =
    profileNewPassword.length === 0 ||
    (isProfilePassLenValid &&
      isProfilePassAlphaValid &&
      isProfilePassNumValid &&
      profileConfirmPassword.length > 0 &&
      profileNewPassword === profileConfirmPassword);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      onClick={() => {
        if (!savingProfile) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#D0DEF7] cursor-default animate-in fade-in zoom-in-95 duration-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#D0DEF7]/60">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#25384C]">
              ตั้งค่าโปรไฟล์แอดมิน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              จัดการรูปโปรไฟล์ ชื่อที่แสดง และรหัสผ่านของคุณ
            </p>
          </div>
          <button
            type="button"
            disabled={savingProfile}
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer text-sm font-bold shrink-0 disabled:opacity-50"
            title="ปิด"
          >
            ✕
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-4 p-3 bg-[#FAF8F2] rounded-xl border border-[#D0DEF7]/60">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D0DEF7] shadow-sm bg-white shrink-0 flex items-center justify-center">
            {adminProfile?.avatarUrl ? (
              <Image
                src={adminProfile.avatarUrl}
                alt={adminProfile.name}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="font-bold text-lg text-[#25384C]">
                {adminProfile?.name?.slice(0, 2).toUpperCase() || "AD"}
              </span>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-[#25384C]/60 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#25384C]">
              รูปโปรไฟล์แอดมิน
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              รองรับ JPG, PNG ขนาดไม่เกิน 5MB
            </p>
            <div className="mt-2">
              <label
                htmlFor="profile-modal-avatar-input"
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md border border-[#D0DEF7] bg-white hover:bg-[#FAF8F2] text-[#25384C] transition cursor-pointer ${
                  uploadingAvatar ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <span>
                  {uploadingAvatar ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
                </span>
              </label>
              <input
                id="profile-modal-avatar-input"
                type="file"
                accept="image/*"
                disabled={uploadingAvatar}
                onChange={onAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <form onSubmit={onSave} autoComplete="off" className="space-y-4">
          <input
            type="text"
            name="prevent_autofill_user"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="prevent_autofill_pwd"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Profile Name */}
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1">
              ชื่อโปรไฟล์แอดมิน <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="เช่น แอดมินร้านเลอเล่อ"
              value={profileNameInput}
              onChange={(e) => setProfileNameInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition font-semibold text-[#25384C]"
            />
          </div>

          {/* Password Section (Optional) */}
          <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#D0DEF7]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#25384C]">
                เปลี่ยนรหัสผ่าน
              </span>
              <span className="text-[10px] text-slate-500">
                เว้นว่างไว้หากไม่เปลี่ยน
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showProfileNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="อย่างน้อย 8 ตัวอักษร มีตัวเลขและตัวอักษร"
                    value={profileNewPassword}
                    onChange={(e) => {
                      setProfileNewPassword(e.target.value);
                      setProfilePasswordError("");
                    }}
                    className="w-full pl-3 pr-9 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfileNewPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-[#25384C] transition cursor-pointer p-0.5"
                    title={
                      showProfileNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                    }
                  >
                    {showProfileNewPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showProfileConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    value={profileConfirmPassword}
                    onChange={(e) => {
                      setProfileConfirmPassword(e.target.value);
                      setProfilePasswordError("");
                    }}
                    className="w-full pl-3 pr-9 py-2 text-xs border border-[#D0DEF7] rounded-lg bg-white outline-none focus:border-[#25384C] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfileConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-[#25384C] transition cursor-pointer p-0.5"
                    title={
                      showProfileConfirmPassword
                        ? "ซ่อนรหัสผ่าน"
                        : "แสดงรหัสผ่าน"
                    }
                  >
                    {showProfileConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Checklist */}
            <PasswordCriteriaChecklist
              password={profileNewPassword}
              confirmPassword={profileConfirmPassword}
              alwaysShow
            />

            {profilePasswordError && (
              <p className="text-xs text-[#B01444] font-semibold">
                {profilePasswordError}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 pt-2 border-t border-[#D0DEF7]/40">
            <button
              type="button"
              disabled={savingProfile}
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={
                savingProfile ||
                !profileNameInput.trim() ||
                !isProfilePassReady
              }
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer"
            >
              {savingProfile ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

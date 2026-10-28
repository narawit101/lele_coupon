"use client";

import React from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export interface AdminLoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  authError: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  authError,
  loading,
  onSubmit,
}: AdminLoginFormProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F2] text-[#25384C]">
      <div className="w-full max-w-sm bg-white rounded-[20px] p-6 sm:p-8 border border-[#D0DEF7] shadow-[0_16px_48px_rgba(37,56,76,0.08)]">
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border border-[#D0DEF7] shadow-sm bg-white">
          <Image
            src="/icon.png"
            alt="LELE' Ticket"
            width={64}
            height={64}
            priority
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold text-center text-[#25384C]">
          LELE&apos; Admin Backoffice
        </h1>
        <p className="text-xs text-center text-[#657406] mt-1">
          ระบบจัดการคูปอง
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
              อีเมล (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5284B7] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="admin@leleticket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-12 pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#D0DEF7] text-sm text-[#25384C] focus:border-[#25384C] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#25384C] mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5284B7] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-12 pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#D0DEF7] text-sm text-[#25384C] focus:border-[#25384C] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#25384C] transition cursor-pointer p-0.5"
                title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {authError && (
            <p className="text-xs text-[#B01444] bg-[#FBEDED] border border-[#B01444]/20 p-2.5 rounded-lg text-center font-medium">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 py-2.5 bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors mt-2 cursor-pointer shadow-sm"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </main>
  );
}

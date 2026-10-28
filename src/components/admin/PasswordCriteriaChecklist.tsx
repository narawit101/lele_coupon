"use client";

import React from "react";

export interface PasswordCriteriaChecklistProps {
  password: string;
  confirmPassword?: string;
  alwaysShow?: boolean;
  className?: string;
}

export default function PasswordCriteriaChecklist({
  password,
  confirmPassword,
  alwaysShow = true,
  className = "",
}: PasswordCriteriaChecklistProps) {
  if (!alwaysShow && password.length === 0) {
    return null;
  }

  const isLenValid = password.length >= 8;
  const isAlphaValid = /[A-Za-z]/.test(password);
  const isNumValid = /[0-9]/.test(password);
  const hasConfirm = typeof confirmPassword === "string";
  const isMatch = hasConfirm && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div
      className={`p-3 bg-[#FAF8F2] rounded-[10px] border border-[#D0DEF7] text-[11px] space-y-1.5 ${className}`}
    >
      <p className="font-semibold text-[#25384C] mb-1">
        เงื่อนไขความปลอดภัยรหัสผ่าน:
      </p>

      {/* Length Check */}
      <div className="flex items-center gap-1.5">
        <span
          className={`font-bold ${
            isLenValid ? "text-[#2D7058]" : "text-slate-400"
          }`}
        >
          {isLenValid ? "✓" : "○"}
        </span>
        <span
          className={
            isLenValid
              ? "text-[#2D7058] font-medium"
              : "text-slate-500"
          }
        >
          ความยาวอย่างน้อย 8 ตัวอักษร ({password.length}/8)
        </span>
      </div>

      {/* English Alphabet Check */}
      <div className="flex items-center gap-1.5">
        <span
          className={`font-bold ${
            isAlphaValid ? "text-[#2D7058]" : "text-slate-400"
          }`}
        >
          {isAlphaValid ? "✓" : "○"}
        </span>
        <span
          className={
            isAlphaValid
              ? "text-[#2D7058] font-medium"
              : "text-slate-500"
          }
        >
          มีตัวอักษรภาษาอังกฤษ (A-Z, a-z)
        </span>
      </div>

      {/* Number Check */}
      <div className="flex items-center gap-1.5">
        <span
          className={`font-bold ${
            isNumValid ? "text-[#2D7058]" : "text-slate-400"
          }`}
        >
          {isNumValid ? "✓" : "○"}
        </span>
        <span
          className={
            isNumValid
              ? "text-[#2D7058] font-medium"
              : "text-slate-500"
          }
        >
          มีตัวเลข (0-9)
        </span>
      </div>

      {/* Password Match Check (if confirmPassword provided) */}
      {hasConfirm && confirmPassword.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#D0DEF7]/60">
          <span
            className={`font-bold ${
              isMatch ? "text-[#2D7058]" : "text-[#B01444]"
            }`}
          >
            {isMatch ? "✓" : "✕"}
          </span>
          <span
            className={`font-medium ${
              isMatch ? "text-[#2D7058]" : "text-[#B01444]"
            }`}
          >
            {isMatch ? "รหัสผ่านตรงกัน" : "รหัสผ่านทั้งสองช่องไม่ตรงกัน"}
          </span>
        </div>
      )}
    </div>
  );
}

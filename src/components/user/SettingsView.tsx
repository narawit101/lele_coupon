"use client";

import React from "react";
import { UserProfile } from "@/types/user";
import { UserCog, LogOut } from "lucide-react";

interface SettingsViewProps {
  user: UserProfile;
  onEditProfile: () => void;
  onRequestLogout: () => void;
}

export default function SettingsView({
  user,
  onEditProfile,
  onRequestLogout,
}: SettingsViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}

      {/* Actions Menu List (Admin Style) */}
      <div className="bg-white rounded-2xl p-2 border border-[#D0DEF7] shadow-2xs space-y-1">
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] font-medium text-xs text-[#25384C] hover:bg-[#FAF8F2] hover:text-[#1B2938] transition cursor-pointer text-left active:scale-[0.99]"
        >
          <UserCog className="w-4 h-4 shrink-0 text-[#5284B7]" />
          <span>แก้ไขข้อมูลส่วนตัว</span>
        </button>

        <div className="my-1 border-t border-[#D0DEF7]/60" />

        <button
          type="button"
          onClick={onRequestLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] font-medium text-xs text-[#B01444] hover:bg-[#FBEDED] transition cursor-pointer text-left active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#B01444]" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Footer Branding Info */}
      <div className="text-center pt-2 pb-6">
        <p className="text-[11px] font-medium text-slate-400">
          LELE&apos; Ticket &bull; #เลอเล่อรับกดบัตร
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserProfile } from "@/types/user";
import { siteConfig } from "@/config/site";
import BaseModal from "@/components/BaseModal";
import {
  UserCog,
  LogOut,
  ExternalLink,
  HelpCircle,
  User as UserIcon,
} from "lucide-react";

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
  const [showRulesModal, setShowRulesModal] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Profile Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#D0DEF7] shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D0DEF7] bg-[#FAF8F2] shrink-0 relative flex items-center justify-center">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={56}
                height={56}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-7 h-7 text-[#5284B7]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#25384C] truncate">
                {user.displayName}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              {user.xHandle && (
                <span className="font-latin text-slate-600">
                  @{user.xHandle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl p-2 border border-[#D0DEF7] shadow-2xs space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400">
          ข้อมูลสมาชิก
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full flex items-center px-3.5 py-3 rounded-xl font-medium text-xs text-[#25384C] hover:bg-[#FAF8F2] hover:text-[#1B2938] transition cursor-pointer text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <UserCog className="w-4 h-4 shrink-0 text-[#5284B7]" />
            <span>แก้ไขข้อมูลส่วนตัว</span>
          </div>
        </button>
      </div>

      {/* Concierge & Shop Contact */}
      <div className="bg-white rounded-2xl p-2 border border-[#D0DEF7] shadow-2xs space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400">
          บริการและช่วยเหลือ
        </div>
        <a
          href={siteConfig.shop.xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center px-3.5 py-3 rounded-xl font-medium text-xs text-[#25384C] hover:bg-[#FAF8F2] hover:text-[#1B2938] transition cursor-pointer text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 shrink-0 text-[#5284B7]" />
            <div>
              <span>ติดต่อแอดมิน / จองคิว</span>
            </div>
          </div>
        </a>

        <div className="border-t border-[#D0DEF7]/60 my-1" />

        {/* Modal-Triggered Rules & Conditions */}
        <button
          type="button"
          onClick={() => setShowRulesModal(true)}
          className="w-full flex items-center px-3.5 py-3 rounded-xl font-medium text-xs text-[#25384C] hover:bg-[#FAF8F2] hover:text-[#1B2938] transition cursor-pointer text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 shrink-0 text-[#5284B7]" />
            <span>กติกาและเงื่อนไขการสะสมแต้ม</span>
          </div>
        </button>
      </div>

      {/* Rules & FAQ Modal */}
      <BaseModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="กติกาและเงื่อนไขการสะสมแต้ม"
        subtitle="ระบบสมาชิกและสิทธิพิเศษ LELE' Ticket"
        maxWidth="max-w-md"
      >
        <div className="p-4 sm:p-5 space-y-3">
          <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#D0DEF7] space-y-1">
            <p className="font-bold text-xs text-[#25384C]">
              1. การรับแต้มสะสม
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              ส่งรีวิวหลังจากงานคอนเสิร์ตหรือศิลปินที่ร้านกดบัตรให้
              พร้อมแนบรูปภาพหรือลิงก์โพสต์ใน X เพื่อรับ 1 แต้มสะสมต่อ 1
              รีวิวเมื่อแอดมินตรวจสอบและอนุมัติ
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#D0DEF7] space-y-1.5">
            <p className="font-bold text-xs text-[#25384C]">
              2. ระดับสมาชิก (Member Tiers)
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              แต้มสะสมจะช่วยเลื่อนระดับสมาชิกอัตโนมัติ:
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px] font-medium text-slate-600">
              <span className="p-1.5 rounded-lg bg-white border border-[#D0DEF7]/60">
                Bronze: 0 แต้ม
              </span>
              <span className="p-1.5 rounded-lg bg-white border border-[#D0DEF7]/60">
                Silver: 10 แต้ม
              </span>
              <span className="p-1.5 rounded-lg bg-white border border-[#D0DEF7]/60">
                Gold: 25 แต้ม
              </span>
              <span className="p-1.5 rounded-lg bg-white border border-[#D0DEF7]/60">
                Platinum: 50 แต้ม
              </span>
              <span className="col-span-2 p-1.5 rounded-lg bg-white border border-[#D0DEF7]/60 text-center font-bold text-[#6B38FB]">
                Diamond: 100+ แต้ม (สูงสุด)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#D0DEF7] space-y-1">
            <p className="font-bold text-xs text-[#25384C]">
              3. การแลกและใช้สิทธิ์ลัดคิว
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              นำแต้มสะสมมาแลกคูปองสิทธิ์ลัดคิวในแท็บ &ldquo;คูปองของฉัน&rdquo;
              และแจ้งรหัสคูปองกับแอดมินทาง DM เมื่อต้องการจองคิวงานคอนเสิร์ต
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full min-h-10 px-4 py-2 bg-[#25384C] hover:bg-[#1B2938] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Logout Action */}
      <div className="bg-white rounded-2xl p-2 border border-[#D0DEF7] shadow-2xs">
        <button
          type="button"
          onClick={onRequestLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs text-[#B01444] hover:bg-[#FBEDED] transition cursor-pointer text-left active:scale-[0.99]"
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

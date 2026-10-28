"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="วิธีสะสมแต้ม & รับสิทธิ์ลัดคิว"
      maxWidth="max-w-md"
    >
      <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
        <div className="p-3.5 rounded-2xl border border-[#D0DEF7] bg-[#FAF8F2]">
          <p className="font-bold text-[#25384C]">1. รีวิวคอนเสิร์ตบน X</p>
          <p className="mt-1 text-slate-600">
            โพสต์รีวิวคอนเสิร์ตบน X พร้อมแฮชแท็ก{" "}
            <b className="font-bold text-[#25384C]">#เลอเล่อรับกดบัตร</b>{" "}
            แล้วส่งหลักฐานในระบบ
          </p>
        </div>

        <div className="p-3.5 rounded-2xl border border-[#D0DEF7] bg-[#FAF8F2]">
          <p className="font-bold text-[#25384C]">2. ใช้สิทธิ์แจ้งทาง DM</p>
          <p className="mt-1 text-slate-600">
            กดใช้สิทธิ์ในระบบ แล้วนำรหัสที่ได้ไปแจ้งในการจองบัตรกับทางเลอเล่อเพื่อรับสิทธิ์
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full py-2.5 bg-[#25384C] hover:bg-[#1B2938] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
      >
        เข้าใจแล้ว
      </button>
    </BaseModal>
  );
}

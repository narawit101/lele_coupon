"use client";

import React from "react";
import Image from "next/image";
import { RefreshCw, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";

export interface UserLoginFormProps {
  loading: boolean;
  statusMessage: string;
  errorMessage: string | null;
  onLogin: () => void;
  onOpenGuide: () => void;
}

export default function UserLoginForm({
  loading,
  statusMessage,
  errorMessage,
  onLogin,
  onOpenGuide,
}: UserLoginFormProps) {
  return (
    <div className="rounded-[20px] border border-[#D0DEF7] bg-white shadow-[0_16px_48px_rgba(37,56,76,0.10)] p-6 sm:p-8 relative overflow-hidden">
      {/* Header & Logo */}
      <div className="flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-white shadow-sm border border-[#D0DEF7] flex items-center justify-center mb-2">
          <Image
            src="/icon.png"
            alt="LELE' Ticket"
            width={80}
            height={80}
            priority
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-[28px] leading-10 font-semibold text-[#25384C] tracking-tight">
          LELE&apos; Ticket
        </h1>
        <p className="text-sm font-semibold text-[#5284B7]">
          #เลอเล่อรับกดบัตร
        </p>
        <p className="mt-3 text-base leading-7 text-[#657406]">
          เข้าสู่ระบบด้วย LINE เพื่อดูบัตรสมาชิกและสะสมแต้ม
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2.5">
            <RefreshCw className="w-8 h-8 text-[#5284B7] animate-spin" />
            <p className="text-sm font-semibold text-[#25384C]">
              {statusMessage}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="w-full min-h-12 bg-green-700 text-white hover:bg-green-600/90 rounded-xl shadow-lg shadow-[#25384C]/20 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#25384C] focus-visible:ring-offset-2"
          >
            {/* LINE SVG Logo */}
            <svg
              className="w-6 h-6 fill-current shrink-0"
              viewBox="0 0 24 24"
            >
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.082.923.254 1.058.583.121.293.079.75.039 1.047l-.164 1.025c-.049.309-.232 1.21 1.059.66 1.29-.549 6.964-4.103 9.497-7.026 1.674-1.879 2.492-3.796 2.492-5.876z" />
            </svg>
            <span>เข้าสู่ระบบด้วย LINE</span>
          </button>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-[#FBEDED] border border-[#B01444]/30 text-sm text-[#B01444] text-center">
            {errorMessage}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={onOpenGuide}
            className="min-h-11 cursor-pointer text-[#315F91] hover:text-[#25384C] transition-colors flex items-center gap-1.5 hover:underline"
          >
            <span>วิธีสะสมแต้มและรับสิทธิ์</span>
          </button>

          <div className="h-3.5 w-px bg-slate-200" />

          <a
            href={siteConfig.shop.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 cursor-pointer text-[#315F91] hover:text-[#25384C] transition-colors flex items-center gap-1.5 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#5284B7]" />
            <span>ติดตามทาง X</span>
          </a>
        </div>
      </div>
    </div>
  );
}

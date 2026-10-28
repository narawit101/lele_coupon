"use client";

import React from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export interface NavbarProps {
  title?: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
  className?: string;
  xUrl?: string | null;
}

export default function Navbar({
  title = "LELE' Ticket",
  subtitle = "#เลอเล่อรับกดบัตร",
  actions,
  maxWidth = "max-w-lg",
  className = "",
  xUrl = siteConfig.shop.xUrl,
}: NavbarProps) {
  return (
    <header
      className={`sticky top-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#D0DEF7] ${className}`}
    >
      <div
        className={`w-full ${maxWidth} mx-auto px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D0DEF7] flex items-center justify-center shadow-sm bg-white shrink-0">
            <Image
              src="/icon.png"
              alt={title}
              width={36}
              height={36}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[#25384C] leading-tight truncate">
              {title}
            </h1>
            {typeof subtitle === "string" ? (
              <p className="text-xs text-[#5284B7] font-medium leading-tight truncate">
                {subtitle}
              </p>
            ) : (
              <div className="text-xs text-[#657406] leading-tight mt-0.5 truncate">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {xUrl && (
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-[#D0DEF7] bg-white hover:bg-[#FAF8F2] hover:border-[#25384C]/40 text-[#25384C] flex items-center justify-center transition shadow-2xs active:scale-95 shrink-0"
              title={`เปิดใน X (${siteConfig.shop.xDisplay})`}
              aria-label={`เปิดใน X (${siteConfig.shop.xDisplay})`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="w-3.5 h-3.5 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
}

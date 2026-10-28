"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export interface ProfileDropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  isExternal?: boolean;
  isDanger?: boolean;
  dividerAbove?: boolean;
}

export interface ProfileDropdownProps {
  name: string;
  avatarUrl?: string | null;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  items: ProfileDropdownItem[];
  title?: string;
}

export default function ProfileDropdown({
  name,
  avatarUrl,
  subtitle,
  badge,
  items,
  title = "เมนูผู้ใช้งาน",
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = name?.trim() ? name.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 pr-2 rounded-full border border-[#D0DEF7] bg-white hover:bg-[#FAF8F2] transition cursor-pointer shadow-2xs active:scale-95"
        title={title}
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D0DEF7] bg-[#FAF8F2] flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={32}
              height={32}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold text-[11px] text-[#25384C]">
              {initials}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5284B7] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Menu Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-24px)] bg-white rounded-[18px] border border-[#D0DEF7] shadow-[0_16px_40px_rgba(37,56,76,0.18)] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          {/* Header Info */}
          <div className="p-3 bg-[#FAF8F2] rounded-[14px] border border-[#D0DEF7]/60 mb-2">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-[#25384C] truncate">
                {name}
              </p>
              {badge}
            </div>
            {subtitle && (
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        item.isDanger ? "text-[#B01444]" : "text-[#5284B7]"
                      }`}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </>
              );

              return (
                <React.Fragment key={item.id}>
                  {item.dividerAbove && (
                    <div className="my-1.5 border-t border-[#D0DEF7]/60" />
                  )}

                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] transition cursor-pointer font-medium text-left ${
                        item.isDanger
                          ? "text-[#B01444] hover:bg-[#FBEDED]"
                          : "text-slate-700 hover:bg-[#FAF8F2] hover:text-[#25384C]"
                      }`}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        item.onClick?.();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] transition cursor-pointer font-medium text-left ${
                        item.isDanger
                          ? "text-[#B01444] hover:bg-[#FBEDED]"
                          : "text-slate-700 hover:bg-[#FAF8F2] hover:text-[#25384C]"
                      }`}
                    >
                      {content}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

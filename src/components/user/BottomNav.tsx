"use client";

import React from "react";
import { CreditCard, Settings } from "lucide-react";

export type UserNavTab = "HOME" | "SETTINGS";

export interface NavTabItem {
  id: UserNavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const USER_NAV_TABS: NavTabItem[] = [
  {
    id: "HOME",
    label: "บัตรสมาชิก",
    icon: CreditCard,
  },
  {
    id: "SETTINGS",
    label: "ตั้งค่า",
    icon: Settings,
  },
];

interface BottomNavProps {
  activeTab: UserNavTab;
  onTabChange: (tab: UserNavTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      aria-label="เมนูหลักด้านล่าง"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#D0DEF7]"
    >
      <div className="max-w-lg mx-auto px-6 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around">
        {USER_NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-colors cursor-pointer select-none ${
                isActive
                  ? "text-[#25384C] font-bold"
                  : "text-slate-400 hover:text-[#25384C]/80 font-medium"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110 text-[#25384C]" : "text-slate-400"
                }`}
              />
              <span className="text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


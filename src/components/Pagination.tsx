"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
  showItemRange?: boolean;
  className?: string;
  compact?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  showItemRange = true,
  className = "",
  compact = false,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate page numbers (max 5 tokens to guarantee mobile fit)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 2) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 1) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex ${
        compact ? "flex-col" : "flex-col sm:flex-row"
      } items-center ${
        compact ? "justify-center gap-2" : "justify-between gap-3"
      } px-4 py-3 sm:px-5 sm:py-3.5 border-t border-[#D0DEF7] bg-[#FAF8F2]/30 text-xs ${className}`}
    >
      {/* Item Range Text */}
      {showItemRange && (
        <div
          className={`text-slate-500 font-medium whitespace-nowrap shrink-0 ${
            compact ? "text-center" : "text-center sm:text-left"
          }`}
        >
          แสดง{" "}
          <span className="font-bold text-[#25384C] font-latin">
            {startItem} - {endItem}
          </span>{" "}
          จากทั้งหมด{" "}
          <span className="font-bold text-[#25384C] font-latin">
            {totalItems}
          </span>{" "}
          รายการ
        </div>
      )}

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
        {/* Prev Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-8 sm:min-h-9 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-[#D0DEF7] text-slate-600 hover:bg-[#FAF8F2] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 shadow-2xs text-xs font-semibold shrink-0"
          title="หน้าก่อนหน้า"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
          <span
            className={
              compact ? "hidden min-[420px]:inline" : "hidden sm:inline"
            }
          >
            ก่อนหน้า
          </span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-slate-400 select-none text-xs"
                >
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 px-2 py-1 rounded-lg font-bold font-latin transition cursor-pointer text-xs ${
                  isActive
                    ? "bg-[#25384C] text-white shadow-2xs"
                    : "bg-white border border-[#D0DEF7] text-[#25384C] hover:bg-[#FAF8F2] shadow-2xs"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-8 sm:min-h-9 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white border border-[#D0DEF7] text-slate-600 hover:bg-[#FAF8F2] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1 shadow-2xs text-xs font-semibold shrink-0"
          title="หน้าถัดไป"
          aria-label="หน้าถัดไป"
        >
          <span
            className={
              compact ? "hidden min-[420px]:inline" : "hidden sm:inline"
            }
          >
            ถัดไป
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface AdminFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  actionButton?: React.ReactNode;
  isLoading?: boolean;
}

export default function AdminFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "ค้นหา...",
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = "สถานะ",
  actionButton,
  isLoading = false,
}: AdminFilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  // Sync when parent updates searchQuery externally (e.g. tab change or reset)
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalQuery(searchQuery);
  }

  // Debounce calling onSearchChange (300ms)
  useEffect(() => {
    if (localQuery === searchQuery) return;

    const timer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, onSearchChange]);

  const handleClear = () => {
    setLocalQuery("");
    onSearchChange("");
    inputRef.current?.focus();
  };

  const isSearching = isLoading || localQuery !== searchQuery;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4">
      <div className="flex flex-1 items-center gap-2 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[#D0DEF7] border-t-[#25384C] rounded-full animate-spin absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          ) : (
            <Search className="w-4 h-4 text-[#5284B7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full min-h-10.5 pl-10 ${
              localQuery ? "pr-9" : "pr-3.5"
            } py-2 rounded-[10px] bg-white border border-[#D0DEF7] text-xs sm:text-sm text-[#25384C] focus:border-[#25384C] outline-none shadow-2xs transition-colors`}
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              title="ล้างข้อความค้นหา"
              aria-label="ล้างข้อความค้นหา"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#25384C] hover:bg-[#FAF8F2] rounded-full transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {filterOptions && filterOptions.length > 0 && onFilterChange && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-[#657406] hidden md:inline">
              {filterLabel}:
            </span>
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="min-h-10.5 px-2.5 sm:px-3 py-2 rounded-[10px] bg-white border border-[#D0DEF7] text-xs font-semibold text-[#25384C] focus:border-[#25384C] outline-none shadow-2xs cursor-pointer max-w-31.25 sm:max-w-none"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Button Slot (e.g. Add Promo, Verify Pass) */}
      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
}

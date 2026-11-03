"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const emptySubscribe = () => () => {};

export interface AdminSelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
}

export interface AdminSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: AdminSelectOption<T>[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

export default function AdminSelect<T extends string = string>({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "เลือก...",
  className = "",
  menuClassName = "",
  ariaLabel,
}: AdminSelectProps<T>) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = Math.min(options.length * 38 + 16, 260);

    const openUpwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    if (openUpwards) {
      setMenuPosition({
        position: "fixed",
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        bottom: `${window.innerHeight - rect.top + 4}px`,
        maxHeight: `${Math.min(spaceAbove - 16, 260)}px`,
        zIndex: 9999,
      });
    } else {
      setMenuPosition({
        position: "fixed",
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: `${rect.bottom + 4}px`,
        maxHeight: `${Math.min(spaceBelow - 16, 260)}px`,
        zIndex: 9999,
      });
    }
  }, [options.length]);

  // Keep menu position synced with trigger element on scroll / resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation: Escape closes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextIndex =
          currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
      } else if (e.key === "ArrowUp" && isOpen) {
        e.preventDefault();
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
      }
    },
    [disabled, isOpen, options, value, onChange],
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative ${className.includes("w-full") ? "w-full" : "inline-block"} text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || selectedOption?.label || placeholder}
        className={`w-full min-h-10 px-3 py-2 text-xs font-semibold rounded-[10px] bg-white border border-[#D0DEF7] text-[#25384C] hover:border-[#25384C]/40 focus:border-[#25384C] outline-none transition cursor-pointer shadow-2xs flex items-center justify-between gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? "border-[#25384C] ring-1 ring-[#25384C]/10" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center justify-center">
              {selectedOption.icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 ml-1">{selectedOption.badge}</span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5284B7] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#25384C]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popover (Portaled to document.body so it is never clipped by modal overflow) */}
      {isOpen &&
        isMounted &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            tabIndex={-1}
            style={menuPosition}
            className={`overflow-y-auto rounded-xl bg-white border border-[#D0DEF7] shadow-xl py-1 outline-none animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition select-none ${
                    isSelected
                      ? "bg-[#FAF8F2] text-[#25384C] font-bold"
                      : "text-[#25384C] hover:bg-[#FAF8F2]/80 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {opt.icon && (
                      <span className="shrink-0 flex items-center justify-center">
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && <span className="shrink-0">{opt.badge}</span>}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#315F91] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

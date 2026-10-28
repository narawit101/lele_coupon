"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  closeDisabled?: boolean;
  showCloseButton?: boolean;
  className?: string;
  bodyClassName?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  closeDisabled = false,
  showCloseButton = true,
  className = "",
  bodyClassName = "",
}: BaseModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDisabled, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      onClick={() => {
        if (!closeDisabled) onClose();
      }}
    >
      <div
        className={`bg-white rounded-[20px] sm:rounded-3xl border border-[#D0DEF7] w-full ${maxWidth} shadow-xl relative cursor-default max-h-[90vh] flex flex-col overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-3 sm:pb-4 border-b border-[#D0DEF7]/60 shrink-0">
            <div className="min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-[#25384C] leading-snug truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#5284B7] mt-0.5 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close modal"
                className="text-[#5284B7] hover:text-[#25384C] p-1 rounded-full hover:bg-[#FAF8F2] transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div
          className={`pb-5 px-5 pr-6 sm:pb-6 sm:pr-6 overflow-y-auto no-scrollbar flex-1 ${bodyClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

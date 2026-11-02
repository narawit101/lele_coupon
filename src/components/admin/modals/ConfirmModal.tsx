"use client";

import React from "react";
import BaseModal from "@/components/BaseModal";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isDestructive = false,
  isLoading = false,
  inputLabel,
  inputPlaceholder = "",
  inputValue = "",
  onInputChange,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      maxWidth="max-w-sm sm:max-w-md"
      closeDisabled={isLoading}
      bodyClassName="space-y-4 pt-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <p className="text-xs text-slate-600 leading-relaxed">
            {message}
          </p>
        )}

        {inputLabel !== undefined && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-700 block">
              {inputLabel}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
              disabled={isLoading}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0DEF7] bg-white focus:outline-none focus:border-[#25384C] text-[#25384C] disabled:bg-slate-50 transition"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0DEF7]/40">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50 ${
              isDestructive
                ? "bg-[#B01444] hover:bg-[#8E1037] text-white"
                : "bg-[#25384C] hover:bg-[#1B2938] text-white"
            }`}
          >
            {isLoading ? "กำลังดำเนินการ..." : confirmText}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { X, Copy, Check } from "lucide-react";
import BaseModal from "@/components/BaseModal";
import { QueuePass } from "@/types/user";
import { formatThaiDateTime } from "@/lib/date";
import Pagination from "@/components/Pagination";

export interface PassWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  passes: QueuePass[];
  total: number;
  page: number;
  totalPages: number;
  status: "ALL" | "ACTIVE" | "USED";
  counts: { all: number; active: number; used: number };
  isLoading: boolean;
  onStatusChange: (status: "ALL" | "ACTIVE" | "USED") => void;
  onPageChange: (page: number) => void;
}

export default function PassWalletModal({
  isOpen,
  onClose,
  passes,
  total,
  page,
  totalPages,
  status,
  counts,
  isLoading,
  onStatusChange,
  onPageChange,
}: PassWalletModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const passListRef = useRef<HTMLDivElement>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("คัดลอกรหัสสิทธิ์ลัดคิวแล้ว");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChangeInternal = (newStatus: "ALL" | "ACTIVE" | "USED") => {
    onStatusChange(newStatus);
    passListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChangeInternal = (newPage: number) => {
    onPageChange(newPage);
    passListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const modalHeader = (
    <div className="p-5 pb-3 border-b border-[#D0DEF7] shrink-0 bg-white">
      <div className="flex items-center justify-between pb-3 border-b border-[#D0DEF7]">
        <h3 className="text-base font-bold text-[#25384C]">
          <span>คูปองรางวัล</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-[#25384C] hover:bg-[#FAF8F2] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("ALL")}
          className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
            status === "ALL"
              ? "bg-[#25384C] text-white shadow-2xs"
              : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
          }`}
        >
          <span className="leading-tight">ทั้งหมด</span>
          <span
            className={`text-[11px] font-latin font-medium leading-none ${
              status === "ALL" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            ({counts.all})
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("ACTIVE")}
          className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
            status === "ACTIVE"
              ? "bg-[#2D7058] text-white shadow-2xs"
              : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
          }`}
        >
          <span className="leading-tight">พร้อมใช้</span>
          <span
            className={`text-[11px] font-latin font-medium leading-none ${
              status === "ACTIVE" ? "text-emerald-200" : "text-slate-500"
            }`}
          >
            ({counts.active})
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleStatusChangeInternal("USED")}
          className={`py-2 px-1.5 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 text-center ${
            status === "USED"
              ? "bg-[#25384C] text-white shadow-2xs"
              : "bg-[#FAF8F2] text-slate-600 hover:bg-[#D0DEF7]/40 border border-[#D0DEF7]"
          }`}
        >
          <span className="leading-tight">ใช้แล้ว</span>
          <span
            className={`text-[11px] font-latin font-medium leading-none ${
              status === "USED" ? "text-slate-300" : "text-slate-500"
            }`}
          >
            ({counts.used})
          </span>
        </button>
      </div>
    </div>
  );

  const modalFooter = totalPages > 1 ? (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={total}
      pageSize={5}
      onPageChange={handlePageChangeInternal}
      compact
      className="rounded-xl border border-[#D0DEF7] overflow-hidden shadow-2xs"
    />
  ) : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      header={modalHeader}
      footer={modalFooter}
      maxWidth="max-w-md"
      bodyClassName="!p-0"
    >
      <div ref={passListRef} className="p-4 sm:p-5 pt-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            กำลังโหลดข้อมูลคูปอง...
          </div>
        ) : passes.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {status === "ACTIVE"
              ? "ไม่มีคูปองที่พร้อมใช้งาน"
              : status === "USED"
                ? "ไม่มีประวัติการใช้คูปอง"
                : "ไม่มีรายการคูปอง"}
          </div>
        ) : (
          <div className="space-y-3">
            {passes.map((pass) => {
              const isUsed = pass.status === "USED";
              const isCodeCopied = copiedCode === pass.code;

              return (
                <div
                  key={pass.id}
                  className={`p-3.5 rounded-2xl border transition relative overflow-hidden ${
                    isUsed
                      ? "bg-[#FAF8F2]/60 border-[#D0DEF7]/80 opacity-75"
                      : "bg-[#FAF8F2] border-[#D0DEF7] shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#25384C] truncate">
                        {pass.rewardTitle || "สิทธิ์ลัดคิว"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isUsed
                          ? "bg-slate-200 text-slate-500"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isUsed ? "ใช้แล้ว" : "พร้อมใช้"}
                    </span>
                  </div>

                  {/* Voucher Code Copy Box */}
                  <div className="mt-2.5 flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-[#D0DEF7]">
                    <span className="font-mono font-bold text-xs text-[#25384C] tracking-wide truncate">
                      {pass.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(pass.code)}
                      className="text-[#315F91] hover:text-[#25384C] p-1 rounded transition cursor-pointer shrink-0"
                      title="คัดลอกรหัส"
                    >
                      {isCodeCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#2D7058]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Metadata: Used / Concert */}
                  <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                    {pass.usedAt ? (
                      <p>
                        ใช้วันที่: {formatThaiDateTime(pass.usedAt)}
                        {pass.usedForConcert && (
                          <span className="ml-1 text-[#25384C] font-semibold">
                            ({pass.usedForConcert})
                          </span>
                        )}
                      </p>
                    ) : null}
                    <p className="text-slate-400">
                      แลกเมื่อ: {formatThaiDateTime(pass.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseModal>
  );
}

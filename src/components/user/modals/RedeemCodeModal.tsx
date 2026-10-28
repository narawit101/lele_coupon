"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import BaseModal from "@/components/BaseModal";

export interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
  onSuccess: () => Promise<void> | void;
  onOpenPasses: () => void;
}

export default function RedeemCodeModal({
  isOpen,
  onClose,
  token,
  onSuccess,
  onOpenPasses,
}: RedeemCodeModalProps) {
  const [specialCodeInput, setSpecialCodeInput] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [codeRedeemResult, setCodeRedeemResult] = useState<{
    message: string;
    rewardType: string;
    rewardTitle: string;
    passCode?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (redeemingCode) return;
    setSpecialCodeInput("");
    setCodeRedeemResult(null);
    onClose();
  };

  const handleRedeemSpecialCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const cleanCode = specialCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("กรุณากรอกรหัสโค้ดพิเศษ");
      return;
    }

    setRedeemingCode(true);
    try {
      const res = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setCodeRedeemResult({
          message: data.message,
          rewardType: data.rewardType,
          rewardTitle: data.rewardTitle,
          passCode: data.passCode,
        });
        await onSuccess();
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาดในการตรวจสอบโค้ด");
      }
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setRedeemingCode(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="กรอกโค้ดพิเศษ"
      maxWidth="max-w-sm"
      closeDisabled={redeemingCode}
    >
      {codeRedeemResult ? (
        <div className="space-y-4 text-center py-2">
          <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#D0DEF7] space-y-1">
            <p className="text-xs font-bold text-[#2D7058]">แลกรับสำเร็จ!</p>
            <p className="text-sm font-bold text-[#25384C]">
              {codeRedeemResult.rewardTitle}
            </p>
            {codeRedeemResult.passCode && (
              <p className="text-xs text-slate-500 font-mono mt-1">
                รหัสคูปอง:{" "}
                <span className="font-bold text-[#25384C]">
                  {codeRedeemResult.passCode}
                </span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {codeRedeemResult.passCode && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenPasses();
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] transition cursor-pointer"
              >
                ดูคูปองของฉัน
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleRedeemSpecialCode}
          autoComplete="off"
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-semibold text-[#25384C] mx-1 my-4">
              รหัสโค้ดพิเศษ <span className="text-[#B01444]">*</span>
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              value={specialCodeInput}
              onChange={(e) => setSpecialCodeInput(e.target.value)}
              className="w-full px-3 py-2.5 text-center font-mono font-bold tracking-wider uppercase text-sm border border-[#D0DEF7] rounded-[10px] bg-white outline-none focus:border-[#25384C] transition"
            />
          </div>

          <div className="flex gap-2 pt-1  border-[#D0DEF7]/40">
            <button
              type="button"
              disabled={redeemingCode}
              onClick={handleClose}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={redeemingCode || !specialCodeInput.trim()}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer"
            >
              {redeemingCode ? "กำลังตรวจสอบ..." : "ยืนยันรับรางวัล"}
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  );
}

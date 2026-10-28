"use client";

import React, { useState, useMemo, useRef } from "react";
import { X, Copy, Check } from "lucide-react";
import { Promotion, QueuePass } from "@/types/user";
import Pagination from "@/components/Pagination";

export interface RewardExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStamps: number;
  promotions: Promotion[];
  isLoading?: boolean;
  onRedeem: (promo: Promotion) => Promise<QueuePass | null>;
  onOpenMyPasses: () => void;
}

export default function RewardExchangeModal({
  isOpen,
  onClose,
  userStamps,
  promotions,
  isLoading = false,
  onRedeem,
  onOpenMyPasses,
}: RewardExchangeModalProps) {
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [confirmPromo, setConfirmPromo] = useState<Promotion | null>(null);
  const [justRedeemed, setJustRedeemed] = useState<QueuePass | null>(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  const promoListRef = useRef<HTMLDivElement>(null);

  const pageSize = 3;
  const totalPages = Math.ceil(promotions.length / pageSize) || 1;
  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return promotions.slice(start, start + pageSize);
  }, [promotions, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    promoListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setJustRedeemed(null);
    setConfirmPromo(null);
    setPage(1);
    setCopied(false);
    onClose();
  };

  const handleExecuteRedeem = async (promo: Promotion) => {
    setRedeemingId(promo.id);
    try {
      const pass = await onRedeem(promo);
      if (pass) {
        setJustRedeemed(pass);
        setConfirmPromo(null);
      }
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#25384C]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 cursor-pointer"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md sm:max-w-lg bg-white rounded-[20px] shadow-2xl border border-[#D0DEF7] overflow-hidden flex flex-col max-h-[90vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D0DEF7] flex items-start justify-between gap-3 bg-[#FAF8F2] shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#25384C]">
              แลกของรางวัล & โปรโมชั่น
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แต้มสะสม:{" "}
              <b className="text-[#25384C] font-latin font-bold text-sm">
                {userStamps}
              </b>{" "}
              แต้ม
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-[#25384C] hover:bg-[#D0DEF7]/40 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={promoListRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className="p-5 overflow-y-auto space-y-3 flex-1 scroll-smooth no-scrollbar bg-[#FAF8F2]"
        >
          {justRedeemed ? (
            /* Result Card */
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#D0DEF7] text-center space-y-4">
              <div>
                <p className="text-xs font-bold text-[#2D7058] mb-1.5">
                  แลกรับสิทธิ์สำเร็จแล้ว!
                </p>
                <h4 className="text-sm font-bold text-[#25384C]">
                  {justRedeemed.rewardTitle || "สิทธิ์ลัดคิว"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  แจ้งรหัสนี้กับแอดมินทาง DM ใน X เพื่อใช้สิทธิ์ตอนจองบัตร
                </p>
              </div>

              {/* Code Display */}
              <div className="p-3.5 bg-white rounded-xl border border-[#D0DEF7] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-base sm:text-lg font-bold text-[#25384C] tracking-wide truncate">
                    {justRedeemed.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(justRedeemed.code)}
                    title="คัดลอกรหัส"
                    className="p-1.5 text-[#315F91] hover:text-[#25384C] hover:bg-[#D0DEF7]/40 rounded-lg border border-transparent hover:border-[#D0DEF7] transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#2D7058]" />
                        <span className="text-[11px] font-semibold text-[#2D7058]">
                          คัดลอกแล้ว
                        </span>
                      </>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenMyPasses();
                  }}
                  className="w-full py-2.5 bg-[#25384C] hover:bg-[#1B2938] text-white font-bold rounded-[10px] text-xs transition cursor-pointer shadow-sm"
                >
                  ดูสิทธิ์ทั้งหมดของฉัน
                </button>
                <button
                  type="button"
                  onClick={() => setJustRedeemed(null)}
                  className="w-full py-2 bg-white hover:bg-[#FAF8F2] text-slate-600 font-semibold rounded-[10px] text-xs border border-[#D0DEF7] transition cursor-pointer"
                >
                  แลกรายการอื่นต่อ
                </button>
              </div>
            </div>
          ) : isLoading && promotions.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-[#D0DEF7] space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-5 w-20 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                    <div className="h-7 w-20 bg-slate-200 rounded-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 bg-[#FAF8F2] rounded-[14px] border border-dashed border-[#D0DEF7]">
              ขณะนี้ยังไม่มีรายการโปรโมชั่นเปิดให้แลก
            </div>
          ) : confirmPromo ? (
            /* Confirmation Step inside the modal */
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F2] border border-[#D0DEF7] space-y-3.5 animate-in fade-in duration-100">
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#25384C]">
                  ยืนยันการแลก: {confirmPromo.title}
                </h4>
                <div className="mt-2.5 p-3.5 bg-white rounded-xl border border-[#D0DEF7] space-y-2 text-xs">
                  {confirmPromo.description && (
                    <p className="text-slate-600 leading-relaxed">
                      {confirmPromo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-[#D0DEF7]/60 text-xs">
                    <span className="text-slate-500">
                      ใช้{" "}
                      <b className="text-[#25384C] font-latin font-bold">
                        {confirmPromo.points}
                      </b>{" "}
                      แต้ม
                    </span>
                    <span className="font-semibold text-[#25384C]">
                      คงเหลือ{" "}
                      <b className="font-latin">
                        {userStamps - confirmPromo.points}
                      </b>{" "}
                      แต้ม
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={redeemingId !== null}
                  onClick={() => setConfirmPromo(null)}
                  className="flex-1 py-2.5 rounded-[10px] border border-[#D0DEF7] bg-white hover:bg-[#FAF8F2] text-xs font-semibold text-slate-600 transition cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  disabled={redeemingId !== null}
                  onClick={() => handleExecuteRedeem(confirmPromo)}
                  className="flex-1 py-2.5 rounded-[10px] bg-[#25384C] hover:bg-[#1B2938] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {redeemingId === confirmPromo.id
                    ? "กำลังแลก..."
                    : "ยืนยันการแลก"}
                </button>
              </div>
            </div>
          ) : (
            <div
              key={page}
              className="space-y-3 transition-opacity duration-200 animate-in fade-in"
            >
              {paginatedPromotions.map((promo) => {
                const canRedeem = userStamps >= promo.points;
                const isRedeeming = redeemingId === promo.id;
                const pointsShort = promo.points - userStamps;

                return (
                  <div
                    key={promo.id}
                    className="p-4 rounded-2xl bg-white border border-[#D0DEF7] space-y-3 transition-all shadow-2xs hover:border-[#25384C]/30"
                  >
                    {/* Top: Title & Points Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold leading-snug truncate ${
                          canRedeem ? "text-[#25384C]" : "text-slate-600"
                        }`}
                      >
                        {promo.title}
                      </h4>
                      <span className="text-xs text-slate-500 shrink-0 font-latin">
                        ใช้{" "}
                        <span
                          className={`text-base font-extrabold ${
                            canRedeem ? "text-[#25384C]" : "text-slate-600"
                          }`}
                        >
                          {promo.points}
                        </span>{" "}
                        แต้ม
                      </span>
                    </div>

                    {/* Middle: Description */}
                    {promo.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {promo.description}
                      </p>
                    )}

                    {/* Bottom: Hairline Divider + Condition & Action */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                      {canRedeem ? (
                        <span className="text-slate-400">
                          พร้อมแลกรับสิทธิ์
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          ขาดอีก{" "}
                          <span className="font-latin font-extrabold text-sm text-[#B01444]">
                            {pointsShort}
                          </span>{" "}
                          แต้ม
                        </span>
                      )}

                      {canRedeem ? (
                        <button
                          type="button"
                          disabled={isRedeeming}
                          onClick={() => setConfirmPromo(promo)}
                          className="px-4 py-1.5 text-xs font-bold rounded-[10px] bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                        >
                          {isRedeeming ? "กำลังแลก..." : "แลกรับสิทธิ์"}
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-400 border border-slate-200">
                          แต้มไม่เพียงพอ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Bottom Pagination */}
        {!confirmPromo && !justRedeemed && totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-[#D0DEF7] bg-white shrink-0">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={promotions.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              compact
              className="rounded-xl border border-[#D0DEF7] overflow-hidden shadow-2xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}

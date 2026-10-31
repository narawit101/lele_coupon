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
  onRedeem: (
    promo: Promotion,
    quantity?: number,
  ) => Promise<QueuePass[] | QueuePass | null>;
  onOpenMyPasses: () => void;
}

function getPromoQuotaSummary(promo: Promotion): string {
  const parts: string[] = [];
  if (promo.quota !== null && promo.quota !== undefined) {
    const rem = promo.remainingQuota ?? promo.quota;
    parts.push(`เหลือ ${rem}/${promo.quota} สิทธิ์`);
  }
  if (promo.maxPerUser) {
    const userUsed = promo.userRedeemedCount ?? 0;
    parts.push(`จำกัด ${userUsed}/${promo.maxPerUser}`);
  }
  if (promo.expiresAt) {
    if (promo.isExpired) {
      parts.push("สิ้นสุดแล้ว");
    } else {
      const expDate = new Date(promo.expiresAt).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      });
      parts.push(`สิ้นสุด ${expDate}`);
    }
  }
  return parts.length > 0 ? parts.join(" • ") : "ไม่จำกัดสิทธิ์";
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
  const [quantity, setQuantity] = useState(1);
  const [justRedeemedPasses, setJustRedeemedPasses] = useState<QueuePass[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const promoListRef = useRef<HTMLDivElement>(null);

  const pageSize = 3;
  const sortedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => {
      const aAvailable = a.canRedeem ?? true;
      const bAvailable = b.canRedeem ?? true;
      if (aAvailable === bAvailable) return 0;
      return aAvailable ? -1 : 1;
    });
  }, [promotions]);

  const totalPages = Math.ceil(sortedPromotions.length / pageSize) || 1;
  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPromotions.slice(start, start + pageSize);
  }, [sortedPromotions, page, pageSize]);

  const maxAvailable = useMemo(() => {
    if (!confirmPromo || confirmPromo.points <= 0) return 1;
    const maxByPoints = Math.max(
      1,
      Math.floor(userStamps / confirmPromo.points),
    );
    const maxByTotalQuota =
      confirmPromo.remainingQuota !== null &&
      confirmPromo.remainingQuota !== undefined
        ? confirmPromo.remainingQuota
        : Infinity;
    const maxByUserQuota =
      confirmPromo.userRemainingQuota !== null &&
      confirmPromo.userRemainingQuota !== undefined
        ? confirmPromo.userRemainingQuota
        : Infinity;
    return Math.max(1, Math.min(maxByPoints, maxByTotalQuota, maxByUserQuota));
  }, [confirmPromo, userStamps]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    promoListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === "") {
      setQuantity(0);
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (num <= 0) {
      setQuantity(1);
    } else if (num > maxAvailable) {
      setQuantity(maxAvailable);
    } else {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity < 1) {
      setQuantity(1);
    } else if (quantity > maxAvailable) {
      setQuantity(maxAvailable);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClose = () => {
    setJustRedeemedPasses([]);
    setConfirmPromo(null);
    setQuantity(1);
    setPage(1);
    setCopiedCode(null);
    onClose();
  };

  const handleExecuteRedeem = async (promo: Promotion, qty: number) => {
    setRedeemingId(promo.id);
    try {
      const res = await onRedeem(promo, qty);
      if (res) {
        const passes = Array.isArray(res) ? res : [res];
        setJustRedeemedPasses(passes);
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
          {justRedeemedPasses.length > 0 ? (
            /* Result Card */
            <div className="p-5 rounded-2xl bg-[#FAF8F2] border border-[#D0DEF7] text-center space-y-4 animate-in fade-in">
              <div>
                <p className="text-xs font-bold text-[#2D7058] mb-1">
                  แลกรับสิทธิ์สำเร็จแล้ว!
                </p>
                <h4 className="text-sm font-bold text-[#25384C]">
                  {justRedeemedPasses[0]?.rewardTitle || "สิทธิ์ลัดคิว"} (
                  {justRedeemedPasses.length} สิทธิ์)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  แจ้งรหัสนี้กับแอดมินทาง DM ใน X เพื่อใช้สิทธิ์ตอนจองบัตร
                </p>
              </div>

              {/* Codes Display List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                {justRedeemedPasses.map((p, idx) => {
                  const isCopied = copiedCode === p.code;
                  return (
                    <div
                      key={p.id || p.code || idx}
                      className="p-3 bg-white rounded-xl border border-[#D0DEF7] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {justRedeemedPasses.length > 1 && (
                          <span className="text-[11px] font-bold text-slate-400 font-latin shrink-0">
                            #{idx + 1}
                          </span>
                        )}
                        <span className="font-mono text-sm sm:text-base font-bold text-[#25384C] tracking-wide truncate">
                          {p.code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(p.code)}
                        title="คัดลอกรหัส"
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/50 text-[#315F91] border border-[#D0DEF7] transition cursor-pointer shrink-0 active:scale-95 flex items-center gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2D7058]" />
                            <span className="text-[11px] text-[#2D7058]">
                              คัดลอกแล้ว
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 opacity-70" />
                            <span className="text-[11px]">คัดลอก</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenMyPasses();
                  }}
                  className="w-full py-2.5 bg-[#25384C] hover:bg-[#1B2938] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  ดูสิทธิ์ทั้งหมดของฉันในกระเป๋า
                </button>
                <button
                  type="button"
                  onClick={() => setJustRedeemedPasses([])}
                  className="w-full py-2 bg-white hover:bg-[#FAF8F2] text-slate-600 font-semibold rounded-xl text-xs border border-[#D0DEF7] transition cursor-pointer active:scale-[0.99]"
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
            /* Confirmation Step with Stepper & Direct Typing */
            <div className="space-y-3.5 animate-in fade-in duration-100">
              {/* Card with All Details */}
              <div className="p-4 rounded-2xl bg-white border border-[#D0DEF7] space-y-3.5 shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-[#25384C]">
                    ยืนยันการแลก: {confirmPromo.title}
                  </h4>
                  {confirmPromo.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      {confirmPromo.description}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 font-latin mt-1.5">
                    {getPromoQuotaSummary(confirmPromo)}
                  </p>
                </div>

                {/* Quantity Stepper & Direct Typing Input */}
                <div className="pt-3 border-t border-[#D0DEF7]/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-[#25384C] block">
                      จำนวนที่ต้องการแลก
                    </span>
                    <span className="text-[11px] text-slate-400">
                      แลกได้สูงสุด {maxAvailable} สิทธิ์
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(1, (q || 1) - 1))
                      }
                      disabled={quantity <= 1 || redeemingId !== null}
                      className="w-8 h-8 rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/50 disabled:opacity-30 border border-[#D0DEF7] text-[#25384C] font-bold text-base flex items-center justify-center transition cursor-pointer select-none active:scale-95"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={maxAvailable}
                      value={quantity === 0 ? "" : quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      disabled={redeemingId !== null}
                      className="w-14 h-8 text-center font-latin font-bold text-sm text-[#25384C] bg-[#FAF8F2] rounded-lg border border-[#D0DEF7] focus:border-[#25384C] outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxAvailable, (q || 0) + 1))
                      }
                      disabled={
                        quantity >= maxAvailable || redeemingId !== null
                      }
                      className="w-8 h-8 rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/50 disabled:opacity-30 border border-[#D0DEF7] text-[#25384C] font-bold text-base flex items-center justify-center transition cursor-pointer select-none active:scale-95"
                    >
                      +
                    </button>
                    {maxAvailable > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuantity(maxAvailable)}
                        disabled={
                          quantity === maxAvailable || redeemingId !== null
                        }
                        className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-[#25384C]/5 hover:bg-[#25384C]/10 text-[#25384C] border border-[#25384C]/20 transition cursor-pointer disabled:opacity-30 select-none ml-1 active:scale-95"
                      >
                        สูงสุด
                      </button>
                    )}
                  </div>
                </div>

                {/* Points Calculation Breakdown */}
                <div className="flex items-center justify-between pt-3 border-t border-[#D0DEF7]/60 text-xs">
                  <span className="text-slate-500">
                    ใช้{" "}
                    <b className="text-[#25384C] font-latin font-bold text-sm">
                      {confirmPromo.points * (quantity || 1)}
                    </b>{" "}
                    แต้ม{" "}
                    {(quantity || 1) > 1 && (
                      <span className="text-[11px] text-slate-400">
                        ({confirmPromo.points} x {quantity || 1})
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-[#25384C]">
                    คงเหลือ{" "}
                    <b className="font-latin text-sm">
                      {userStamps - confirmPromo.points * (quantity || 1)}
                    </b>{" "}
                    แต้ม
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={redeemingId !== null}
                  onClick={() => setConfirmPromo(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#D0DEF7] bg-white hover:bg-[#FAF8F2] text-xs font-semibold text-slate-600 transition cursor-pointer"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  disabled={redeemingId !== null || quantity < 1}
                  onClick={() =>
                    handleExecuteRedeem(confirmPromo, Math.max(1, quantity))
                  }
                  className="flex-1 py-2.5 rounded-xl bg-[#25384C] hover:bg-[#1B2938] text-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {redeemingId === confirmPromo.id
                    ? "กำลังแลก..."
                    : `ยืนยันการแลก (${Math.max(1, quantity)} สิทธิ์)`}
                </button>
              </div>
            </div>
          ) : (
            <div
              key={page}
              className="space-y-3 transition-opacity duration-200 animate-in fade-in"
            >
              {paginatedPromotions.map((promo) => {
                const isAvailable = promo.canRedeem ?? true;
                const hasEnoughPoints = userStamps >= promo.points;
                const canClickRedeem = isAvailable && hasEnoughPoints;
                const isRedeeming = redeemingId === promo.id;
                const pointsShort = promo.points - userStamps;

                const quotaSummary = getPromoQuotaSummary(promo);

                return (
                  <div
                    key={promo.id}
                    className="p-4 rounded-2xl bg-white border border-[#D0DEF7] space-y-3 transition-all shadow-2xs hover:border-[#25384C]/30"
                  >
                    {/* Top: Title & Points Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm font-bold leading-snug truncate ${
                          canClickRedeem ? "text-[#25384C]" : "text-slate-600"
                        }`}
                      >
                        {promo.title}
                      </h4>
                      <span className="text-xs text-slate-500 shrink-0 font-latin">
                        ใช้{" "}
                        <span
                          className={`text-base font-extrabold ${
                            canClickRedeem ? "text-[#25384C]" : "text-slate-600"
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2.5 border-t border-slate-100 text-xs gap-2 sm:gap-3">
                      <div className="min-w-0 w-full sm:w-auto sm:flex-1">
                        {!hasEnoughPoints && isAvailable ? (
                          <div className="text-xs text-slate-500">
                            {quotaSummary && (
                              <span className="text-slate-400 font-latin mr-1.5">
                                {quotaSummary} •
                              </span>
                            )}
                            <span>
                              ขาดอีก{" "}
                              <span className="font-latin font-extrabold text-sm text-[#B01444]">
                                {pointsShort}
                              </span>{" "}
                              แต้ม
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-latin block">
                            {quotaSummary || "ไม่จำกัดสิทธิ์"}
                          </span>
                        )}
                      </div>

                      {canClickRedeem ? (
                        <button
                          type="button"
                          disabled={isRedeeming}
                          onClick={() => {
                            setConfirmPromo(promo);
                            setQuantity(1);
                          }}
                          className="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-xs font-bold rounded-[10px] bg-[#25384C] hover:bg-[#1B2938] text-white transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 shrink-0 text-center"
                        >
                          {isRedeeming ? "กำลังแลก..." : "แลกรับสิทธิ์"}
                        </button>
                      ) : !isAvailable ? (
                        <span className="w-full sm:w-auto px-3 py-2 sm:py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-400 border border-slate-200 shrink-0 text-center block sm:inline-block">
                          {promo.reasonDisabled || "ไม่พร้อมใช้งาน"}
                        </span>
                      ) : (
                        <span className="w-full sm:w-auto px-3 py-2 sm:py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-400 border border-slate-200 shrink-0 text-center block sm:inline-block">
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
        {!confirmPromo && justRedeemedPasses.length === 0 && totalPages > 1 && (
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

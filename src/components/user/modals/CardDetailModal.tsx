"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, X } from "lucide-react";
import { getMemberTier } from "@/lib/tier";
import { UserProfile } from "@/types/user";
import { toast } from "react-toastify";
import UserCardContent from "../UserCardContent";

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  sourceRect?: DOMRect | null;
}

export default function CardDetailModal({
  isOpen,
  onClose,
  user,
  sourceRect,
}: CardDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Synchronize state during render when modal opens/closes without cascading effect renders
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsExpanded(false);
      setIsClosing(false);
      setIsFlipped(false);
    }
  }

  // Compute initial delta from viewport and sourceRect for instant zero-flash FLIP start
  const initialDelta = React.useMemo(() => {
    if (!sourceRect || typeof window === "undefined") {
      return { x: 0, y: 30, scale: 0.92 };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxModalW = vw >= 640 ? 448 : 384; // sm:max-w-md (448px) vs max-w-sm (384px)
    const modalW = Math.min(vw - 32, maxModalW);

    const modalCenterX = vw / 2;
    const modalCenterY = vh / 2;
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;

    return {
      x: sourceCenterX - modalCenterX,
      y: sourceCenterY - modalCenterY,
      scale: sourceRect.width / modalW,
    };
  }, [sourceRect]);

  // Trigger expansion into center on mount
  React.useEffect(() => {
    if (!isOpen) return;

    // Give browser 1 frame to paint at initial source position, then animate to center
    let innerFrame: number;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        setIsExpanded(true);
      });
    });

    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [isOpen]);

  // Smooth collapse back to source position
  const handleClose = () => {
    if (isClosing) return;

    // Immediately flip back to front if viewing back of card
    if (isFlipped) {
      setIsFlipped(false);
    }

    setIsClosing(true);
    setIsExpanded(false);

    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 380);
  };

  const memberTier = React.useMemo(() => getMemberTier(user), [user]);

  if (!isOpen) return null;

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    toast.success("คัดลอก Member ID เรียบร้อยแล้ว");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const transformStyle: React.CSSProperties = {
    transform:
      isExpanded && !isClosing
        ? "translate3d(0, 0, 0) scale(1)"
        : `translate3d(${initialDelta.x}px, ${initialDelta.y}px, 0) scale(${initialDelta.scale})`,
    transition: isClosing
      ? "transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)"
      : isExpanded
        ? "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)"
        : "none",
    transformOrigin: "center center",
    willChange: "transform",
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#25384C]/80 backdrop-blur-md flex items-center justify-center p-4 select-none transition-opacity duration-350 ease-out ${
        isExpanded && !isClosing
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={handleClose}
        className={`absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-300 cursor-pointer z-60 ${
          isExpanded && !isClosing
            ? "opacity-100 scale-100"
            : "opacity-0 scale-75 pointer-events-none"
        }`}
        title="ปิด"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Shared Element FLIP Container */}
      <div
        style={transformStyle}
        className="w-full max-w-sm sm:max-w-md aspect-4/3 relative cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          // Allow flip only when fully opened
          if (isExpanded && !isClosing) {
            setIsFlipped((prev) => !prev);
          }
        }}
      >
        {/* Inner 3D Flip Wrapper */}
        <div className="w-full h-full relative perspective-distant">
          {/* ==================== FRONT FACE (CRYSTAL CARD - NO WHITE CORNERS) ==================== */}
          <div
            className="absolute inset-0 w-full h-full bg-transparent transition-all duration-500 ease-in-out"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              opacity: isFlipped ? 0 : 1,
              pointerEvents: isFlipped ? "none" : "auto",
            }}
          >
            <UserCardContent user={user} />
          </div>

          {/* ==================== BACK FACE (MATCHES FRONT CRYSTAL SILHOUETTE & BACKGROUND) ==================== */}
          <div
            className="absolute inset-0 w-full h-full bg-transparent transition-all duration-500 ease-in-out"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
              opacity: isFlipped ? 1 : 0,
              pointerEvents: isFlipped ? "auto" : "none",
            }}
          >
            {/* VIP Crystal Frame - Symmetrical Reflection of Front Face */}
            {memberTier.cardFrameImage && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <Image
                  src={memberTier.cardFrameImage}
                  alt=""
                  fill
                  unoptimized
                  priority
                  style={{ objectFit: "fill", border: 0, outline: "none" }}
                  className="w-full h-full pointer-events-none select-none scale-x-[-1] border-0 outline-none"
                />
              </div>
            )}

            {/* Decorative Brand Watermark */}
            <div className="pointer-events-none select-none absolute inset-0 bottom-6 sm:bottom-8 left-6 sm:left-8 overflow-hidden z-1">
              <div className="absolute left-0 bottom-0 w-36 h-36 sm:w-44 sm:h-44 opacity-30 sm:opacity-35 overflow-hidden rounded-full">
                <Image
                  src="/icon.png"
                  alt=""
                  width={160}
                  height={160}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Back Content: Perfectly Aligned to Crystal Card Safe Area */}
            <div className="relative z-10 h-full px-[9%] sm:px-[10%] pt-[24.5%] sm:pt-[25%] pb-[14%] sm:pb-[14.5%] flex flex-col justify-between">
              {/* Top / Center: Member ID Box with Inline Copy */}
              <div className="w-full">
                <span className="text-[10px] ml-2 sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  รหัสสมาชิก
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-white/75 backdrop-blur-xs border border-[#D0DEF7] shadow-2xs">
                  <span className="font-mono text-xs sm:text-[13px] font-bold text-[#25384C] tracking-wide break-all select-all">
                    {user.id || "-"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="shrink-0 p-1.5 sm:p-2 rounded-lg bg-[#FAF8F2] hover:bg-[#D0DEF7]/50 text-[#315F91] hover:text-[#25384C] border border-[#D0DEF7] transition cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
                    title="คัดลอกรหัสสมาชิก"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2D7058]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-75" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom: Points Summary (Current & Lifetime Points) */}
              <div className="mt-auto pt-2 sm:pt-2.5 border-t border-[#25384C]/10 grid grid-cols-2 gap-2 pl-2">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                    แต้มสะสมปัจจุบัน
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-latin text-2xl sm:text-3xl font-extrabold text-[#25384C]">
                      {user.stamps.toLocaleString()}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                      แต้ม
                    </span>
                  </div>
                </div>
                <div className="border-l border-[#25384C]/10 pl-3 sm:pl-4">
                  <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                    แต้มสะสมทั้งหมด
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-latin text-2xl sm:text-3xl font-extrabold ">
                      {(user.lifetimeStamps ?? user.stamps).toLocaleString()}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#657406]">
                      แต้ม
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

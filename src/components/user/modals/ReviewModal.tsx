"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import BaseModal from "@/components/BaseModal";

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultXHandle?: string;
  onSuccess: () => Promise<void> | void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  userId,
  defaultXHandle = "",
  onSuccess,
}: ReviewModalProps) {
  const [reviewConcert, setReviewConcert] = useState("");
  const [reviewXHandle, setReviewXHandle] = useState("");
  const [reviewPostUrl, setReviewPostUrl] = useState("");
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setReviewXHandle(defaultXHandle);
      });
    }
  }, [isOpen, defaultXHandle]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submittingReview) return;
    setReviewConcert("");
    setReviewPostUrl("");
    setReviewFile(null);
    setReviewImage(null);
    setReviewXHandle(defaultXHandle);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("ขนาดรูปภาพต้องไม่เกิน 10MB");
        return;
      }
      setReviewFile(file);
      setReviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewConcert || !reviewXHandle) {
      toast.error("กรุณาระบุชื่องานและชื่อบัญชี X");
      return;
    }
    if (!reviewPostUrl && !reviewFile && !reviewImage) {
      toast.error("กรุณาใส่ลิงก์โพสต์ใน X หรือแนบรูปภาพหลักฐานรีวิว");
      return;
    }

    setSubmittingReview(true);
    try {
      let finalImageUrl = reviewImage;

      // Upload image to Cloudinary (folder: coupon/reviews)
      if (reviewFile) {
        const formData = new FormData();
        formData.append("file", reviewFile);
        formData.append("type", "reviews");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          toast.error(err.error || "อัปโหลดรูปภาพขึ้น Cloudinary ไม่สำเร็จ");
          setSubmittingReview(false);
          return;
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          concertName: reviewConcert,
          xHandle: reviewXHandle,
          postUrl: reviewPostUrl,
          imageUrl: finalImageUrl,
        }),
      });

      if (res.ok) {
        toast.success("ส่งรีวิวเรียบร้อยแล้ว");
        handleClose();
        await onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "เกิดข้อผิดพลาดในการส่งรีวิว");
      }
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="ส่งรีวิวขอรับแต้มสะสม"
      maxWidth="max-w-md"
      closeDisabled={submittingReview}
    >
      <form onSubmit={handleSubmitReview} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ชื่องานคอนเสิร์ต <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="เช่น VELVET MOON CONCERT, BLUE HOUR"
            value={reviewConcert}
            onChange={(e) => setReviewConcert(e.target.value)}
            className="w-full min-h-13 px-3.5 py-2.5 rounded-xl border border-[#D0DEF7] text-sm focus:border-[#25384C] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ชื่อบัญชี X (Twitter) ที่ใช้โพสต์รีวิว{" "}
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm font-medium text-slate-400 pointer-events-none select-none">
              @
            </span>
            <input
              type="text"
              required
              placeholder="username (ไม่ต้องใส่ @)"
              value={reviewXHandle}
              onChange={(e) => setReviewXHandle(e.target.value)}
              className="w-full min-h-13 pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D0DEF7] text-sm focus:border-[#25384C] outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ลิงก์โพสต์รีวิวใน X (ถ้ามี)
          </label>
          <input
            type="url"
            placeholder="https://x.com/.../status/..."
            value={reviewPostUrl}
            onChange={(e) => setReviewPostUrl(e.target.value)}
            className="w-full min-h-13 px-3.5 py-2.5 rounded-xl border border-[#D0DEF7] text-sm focus:border-[#25384C] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            รูปภาพแคปหน้าจอรีวิว
          </label>
          {!reviewImage ? (
            <label
              htmlFor="review-image-upload"
              className="w-full min-h-13 px-3.5 py-2.5 rounded-xl border border-[#D0DEF7] bg-[#FAF8F2] hover:bg-white text-[#25384C] flex items-center justify-between gap-3 transition cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-[#25384C] truncate">
                    เลือกรูปภาพจากเครื่อง
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#315F91] px-2.5 py-1 rounded-lg bg-white border border-[#D0DEF7] shrink-0">
                เลือกรูป
              </span>
              <input
                id="review-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="p-2.5 rounded-xl border border-[#D0DEF7] bg-[#FAF8F2] flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-[10px] overflow-hidden border border-[#D0DEF7] bg-white shrink-0">
                  <Image
                    src={reviewImage}
                    alt="Review Preview"
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2D7058] flex items-center gap-1.5 truncate">
                    <span>แนบรูปภาพแล้ว</span>
                  </p>
                  <label
                    htmlFor="review-image-upload"
                    className="text-[11px] text-[#315F91] hover:underline cursor-pointer font-medium mt-0.5 inline-block"
                  >
                    แตะเพื่อเปลี่ยนรูป
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewFile(null);
                  setReviewImage(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-[#B01444] transition cursor-pointer shrink-0"
                title="ลบรูปภาพ"
              >
                <X className="w-4 h-4" />
              </button>
              <input
                id="review-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#FCF2D9]/70 border border-[#F7EBC9] text-xs text-[#956018]">
          <span className="font-bold shrink-0">ข้อแนะนำ:</span>
          <span className="truncate">
            โพสต์รีวิวต้องติดแฮชแท็ก{" "}
            <b className="font-bold">#เลอเล่อรับกดบัตร</b>
          </span>
        </div>

        <button
          type="submit"
          disabled={submittingReview}
          className="w-full min-h-12 py-3 bg-[#25384C] hover:bg-[#1B2938] disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md shadow-[#25384C]/20 transition-all flex items-center justify-center cursor-pointer"
        >
          <span>{submittingReview ? "กำลังส่งข้อมูล..." : "ยืนยัน"}</span>
        </button>
      </form>
    </BaseModal>
  );
}

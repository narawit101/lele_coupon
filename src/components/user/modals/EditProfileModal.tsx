"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { User as UserIcon } from "lucide-react";
import BaseModal from "@/components/BaseModal";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
  initialXHandle?: string | null;
  initialPhone?: string | null;
  currentAvatarUrl?: string | null;
  onSuccess: () => Promise<void> | void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  token,
  initialXHandle = "",
  initialPhone = "",
  currentAvatarUrl,
  onSuccess,
}: EditProfileModalProps) {
  const [editXHandle, setEditXHandle] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setEditXHandle(initialXHandle || "");
        setEditPhone(initialPhone || "");
        setAvatarFile(null);
        setAvatarPreview(currentAvatarUrl || null);
      });
    }
  }, [isOpen, initialXHandle, initialPhone, currentAvatarUrl]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (savingProfile) return;
    setAvatarFile(null);
    setAvatarPreview(null);
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดรูปภาพต้องไม่เกิน 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    try {
      let finalAvatarUrl = undefined;

      // Upload avatar to Cloudinary (folder: coupon/users)
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("type", "users");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          toast.error(err.error || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
          setSavingProfile(false);
          return;
        }

        const uploadData = await uploadRes.json();
        finalAvatarUrl = uploadData.url;
      }

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          xHandle: editXHandle,
          phone: editPhone,
          ...(finalAvatarUrl !== undefined && { avatarUrl: finalAvatarUrl }),
        }),
      });

      if (res.ok) {
        await onSuccess();
        handleClose();
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      } else {
        toast.error("บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="แก้ไขข้อมูลส่วนตัว"
      maxWidth="max-w-sm"
      closeDisabled={savingProfile}
    >
      <form onSubmit={handleSaveProfile} className="space-y-3">
        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center justify-center py-2 text-center w-full">
          <div className="flex flex-col items-center">
            <label
              htmlFor="user-avatar-upload"
              className="relative group block w-20 h-20 rounded-full overflow-hidden border-2 border-[#D0DEF7] bg-[#FAF8F2] shadow-inner cursor-pointer mx-auto"
            >
              {avatarPreview || currentAvatarUrl ? (
                <Image
                  src={avatarPreview || currentAvatarUrl!}
                  alt="Avatar Preview"
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-[#5284B7]" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </label>

            <label
              htmlFor="user-avatar-upload"
              className="mt-2 text-xs font-semibold text-[#315F91] hover:text-[#25384C] cursor-pointer hover:underline text-center"
            >
              แตะเพื่อเปลี่ยนรูปโปรไฟล์
            </label>
          </div>

          <input
            id="user-avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            ชื่อบัญชี X
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-sm font-medium text-slate-400 pointer-events-none select-none">
              @
            </span>
            <input
              type="text"
              placeholder="username"
              value={editXHandle}
              onChange={(e) => setEditXHandle(e.target.value)}
              className="w-full min-h-13 pl-8 pr-3 py-2 rounded-xl border border-[#D0DEF7] text-sm focus:border-[#25384C] outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            เบอร์โทรศัพท์
          </label>
          <input
            type="tel"
            placeholder="08X-XXX-XXXX"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full min-h-13 px-3 py-2 rounded-xl border border-[#D0DEF7] text-sm focus:border-[#25384C] outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={savingProfile}
            onClick={handleClose}
            className="flex-1 min-h-12 text-sm font-semibold rounded-xl bg-white hover:bg-[#FAF8F2] text-slate-700 border border-[#D0DEF7] transition cursor-pointer disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={savingProfile}
            className="flex-1 min-h-12 text-sm font-semibold rounded-xl bg-[#25384C] text-white hover:bg-[#1B2938] transition cursor-pointer disabled:opacity-50"
          >
            {savingProfile ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}

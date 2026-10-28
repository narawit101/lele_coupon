"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { adminFetch } from "@/lib/adminApi";
import { AdminProfile } from "../types";

export function useAdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [adminToken, setAdminToken] = useState<string>("");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Forced Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForcedNewPassword, setShowForcedNewPassword] = useState(false);
  const [showForcedConfirmPassword, setShowForcedConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Settings Modal State
  const [showProfileSettingsModal, setShowProfileSettingsModal] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [showProfileNewPassword, setShowProfileNewPassword] = useState(false);
  const [showProfileConfirmPassword, setShowProfileConfirmPassword] = useState(false);
  const [profilePasswordError, setProfilePasswordError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("lele_admin_token");
    localStorage.removeItem("lele_admin_profile");
    setIsAuthenticated(false);
    setAdminToken("");
    setAdminProfile(null);
    setEmail("");
    setPassword("");
  }, []);

  // Check stored session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("lele_admin_token");
      const savedProfile = localStorage.getItem("lele_admin_profile");
      if (savedToken && savedProfile) {
        setAdminToken(savedToken);
        try {
          const prof = JSON.parse(savedProfile);
          setAdminProfile(prof);
          setIsAuthenticated(true);
        } catch {
          handleLogout();
        }
      }
      setAuthChecking(false);
    };

    initAuth();
  }, [handleLogout]);

  // Sync session across browser tabs in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lele_admin_token") {
        if (!e.newValue) {
          // Logged out in another tab
          setIsAuthenticated(false);
          setAdminToken("");
          setAdminProfile(null);
        } else if (e.newValue !== adminToken) {
          // Logged in or changed token in another tab
          setAdminToken(e.newValue);
          const prof = localStorage.getItem("lele_admin_profile");
          if (prof) {
            try {
              setAdminProfile(JSON.parse(prof));
              setIsAuthenticated(true);
            } catch {
              // Ignore json error
            }
          }
        }
      } else if (e.key === "lele_admin_profile") {
        if (!e.newValue) {
          setAdminProfile(null);
        } else {
          try {
            setAdminProfile(JSON.parse(e.newValue));
          } catch {
            // Ignore json error
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [adminToken]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        setAdminToken(data.token);
        setAdminProfile(data.admin);
        setIsAuthenticated(true);
        localStorage.setItem("lele_admin_token", data.token);
        localStorage.setItem("lele_admin_profile", JSON.stringify(data.admin));
      } else {
        setAuthError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch {
      setAuthError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("รหัสผ่านใหม่ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข");
      return;
    }
    if (newPassword === "1234") {
      setPasswordError("ไม่สามารถใช้รหัสผ่านเริ่มต้น 1234 ได้");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        token: adminToken,
        json: { newPassword },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        if (data.admin) {
          setAdminProfile(data.admin);
          localStorage.setItem("lele_admin_profile", JSON.stringify(data.admin));
        }
        if (data.token) {
          setAdminToken(data.token);
          localStorage.setItem("lele_admin_token", data.token);
        }
      } else {
        setPasswordError(data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      }
    } catch {
      setPasswordError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingPassword(false);
    }
  };

  const openProfileSettingsModal = () => {
    setProfileNameInput(adminProfile?.name || "");
    setProfileNewPassword("");
    setProfileConfirmPassword("");
    setShowProfileNewPassword(false);
    setShowProfileConfirmPassword(false);
    setProfilePasswordError("");
    setShowProfileSettingsModal(true);
  };

  const closeProfileSettingsModal = () => {
    setShowProfileSettingsModal(false);
    setProfilePasswordError("");
  };

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilePasswordError("");

    const trimmedName = profileNameInput.trim();
    if (!trimmedName) {
      toast.error("กรุณาระบุชื่อโปรไฟล์");
      return;
    }

    const isChangingPassword = profileNewPassword.length > 0;
    if (isChangingPassword) {
      if (profileNewPassword.length < 8) {
        setProfilePasswordError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
        return;
      }
      if (!/[a-zA-Z]/.test(profileNewPassword) || !/[0-9]/.test(profileNewPassword)) {
        setProfilePasswordError("รหัสผ่านใหม่ต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข");
        return;
      }
      if (profileNewPassword === "1234") {
        setProfilePasswordError("ไม่สามารถใช้รหัสผ่านเริ่มต้น 1234 ได้");
        return;
      }
      if (profileNewPassword !== profileConfirmPassword) {
        setProfilePasswordError("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
        return;
      }
    }

    setSavingProfile(true);
    try {
      let updatedAdmin = adminProfile;

      // 1. Update name if changed
      if (trimmedName !== adminProfile?.name) {
        const resName = await adminFetch("/api/admin/profile", {
          method: "PATCH",
          token: adminToken,
          json: { name: trimmedName },
        });
        if (!resName.ok) {
          const err = await resName.json();
          toast.error(err.error || "แก้ไขชื่อไม่สำเร็จ");
          setSavingProfile(false);
          return;
        }
        const dataName = await resName.json();
        updatedAdmin = dataName.admin;
      }

      // 2. Update password if requested
      if (isChangingPassword) {
        const resPass = await adminFetch("/api/admin/change-password", {
          method: "POST",
          token: adminToken,
          json: { newPassword: profileNewPassword },
        });
        const dataPass = await resPass.json();
        if (!resPass.ok) {
          setProfilePasswordError(dataPass.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
          setSavingProfile(false);
          return;
        }
        if (dataPass.admin) updatedAdmin = dataPass.admin;
        if (dataPass.token) {
          setAdminToken(dataPass.token);
          localStorage.setItem("lele_admin_token", dataPass.token);
        }
      }

      if (updatedAdmin) {
        setAdminProfile(updatedAdmin);
        localStorage.setItem("lele_admin_profile", JSON.stringify(updatedAdmin));
      }
      toast.success("บันทึกการตั้งค่าโปรไฟล์เรียบร้อยแล้ว");
      closeProfileSettingsModal();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAdminAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดรูปภาพต้องไม่เกิน 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "admins");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        toast.error(err.error || "อัปโหลดรูปภาพขึ้น Cloudinary ไม่สำเร็จ");
        return;
      }

      const uploadData = await uploadRes.json();
      const newAvatarUrl = uploadData.url;

      const patchRes = await adminFetch("/api/admin/profile", {
        method: "PATCH",
        token: adminToken,
        json: { avatarUrl: newAvatarUrl },
      });

      if (patchRes.ok) {
        const data = await patchRes.json();
        setAdminProfile(data.admin);
        if (data.token) {
          setAdminToken(data.token);
          localStorage.setItem("lele_admin_token", data.token);
        }
        localStorage.setItem("lele_admin_profile", JSON.stringify(data.admin));
        toast.success("อัปเดตรูปโปรไฟล์แอดมินเรียบร้อยแล้ว");
      } else {
        toast.error("บันทึกรูปโปรไฟล์ไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showLoginPassword,
    setShowLoginPassword,
    adminToken,
    adminProfile,
    setAdminProfile,
    isAuthenticated,
    authChecking,
    authError,
    loginLoading,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showForcedNewPassword,
    setShowForcedNewPassword,
    showForcedConfirmPassword,
    setShowForcedConfirmPassword,
    passwordError,
    savingPassword,
    showProfileSettingsModal,
    profileNameInput,
    setProfileNameInput,
    profileNewPassword,
    setProfileNewPassword,
    profileConfirmPassword,
    setProfileConfirmPassword,
    showProfileNewPassword,
    setShowProfileNewPassword,
    showProfileConfirmPassword,
    setShowProfileConfirmPassword,
    profilePasswordError,
    setProfilePasswordError,
    savingProfile,
    uploadingAvatar,
    handleLoginSubmit,
    handleForceChangePassword,
    handleLogout,
    openProfileSettingsModal,
    closeProfileSettingsModal,
    handleSaveProfileSettings,
    handleAdminAvatarUpload,
  };
}

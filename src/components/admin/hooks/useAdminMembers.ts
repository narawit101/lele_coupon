"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { adminFetch } from "@/lib/adminApi";
import { AdminMember, AdminProfile } from "../types";

export interface UseAdminMembersOptions {
  adminToken: string;
  adminProfile: AdminProfile | null;
  onProfileUpdate?: (profile: AdminProfile) => void;
  onRefreshAll?: () => Promise<void>;
}

export function useAdminMembers({
  adminToken,
  adminProfile,
  onProfileUpdate,
  onRefreshAll,
}: UseAdminMembersOptions) {
  const [membersSubTab, setMembersSubTab] = useState<"CUSTOMERS" | "ADMINS">("CUSTOMERS");
  const [customersTotal, setCustomersTotal] = useState(0);
  const [adminsTotal, setAdminsTotal] = useState(0);

  const [members, setMembers] = useState<AdminMember[]>([]);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(1);
  const [membersSearch, setMembersSearch] = useState("");
  const [membersSortBy, setMembersSortBy] = useState<
    "displayName" | "xHandle" | "stamps" | "passes" | ""
  >("");
  const [membersSortOrder, setMembersSortOrder] = useState<"asc" | "desc">("desc");
  const [membersLoading, setMembersLoading] = useState(true);

  // Adjust Stamps Modal
  const [adjustModalUser, setAdjustModalUser] = useState<AdminMember | null>(null);
  const [adjustMode, setAdjustMode] = useState<"ADD" | "DEDUCT">("ADD");
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Edit Admin Modal
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<{
    id: string;
    name: string;
    role?: string;
  } | null>(null);
  const [editAdminName, setEditAdminName] = useState("");
  const [savingEditAdmin, setSavingEditAdmin] = useState(false);

  // New Admin Modal
  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPasswordMode, setNewAdminPasswordMode] = useState<"DEFAULT" | "CUSTOM">("DEFAULT");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [savingNewAdmin, setSavingNewAdmin] = useState(false);

  const membersStatus = membersSubTab === "ADMINS" ? "ADMIN" : "ALL";

  const fetchMembers = useCallback(
    async (
      token = adminToken,
      page = membersPage,
      q = membersSearch,
      status = membersStatus,
      sortBy = membersSortBy,
      sortOrder = membersSortOrder,
    ) => {
      if (!token) return;
      setMembersLoading(true);
      try {
        const res = await adminFetch(
          `/api/admin/members?page=${page}&limit=10&q=${encodeURIComponent(q)}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          { token },
        );
        if (res.ok) {
          const d = await res.json();
          setMembers(d.members || []);
          setMembersTotal(d.total || 0);
          setMembersTotalPages(d.totalPages || 1);
          if (typeof d.customersTotal === "number") setCustomersTotal(d.customersTotal);
          if (typeof d.adminsTotal === "number") setAdminsTotal(d.adminsTotal);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setMembersLoading(false);
      }
    },
    [adminToken, membersPage, membersSearch, membersStatus, membersSortBy, membersSortOrder],
  );

  const handleSubTabChange = (tab: "CUSTOMERS" | "ADMINS") => {
    setMembersSubTab(tab);
    setMembersPage(1);
    setMembersSearch("");
    setMembersSortBy("");
  };

  useEffect(() => {
    let ignore = false;
    if (adminToken) {
      queueMicrotask(() => {
        if (!ignore) {
          void fetchMembers();
        }
      });
    }
    return () => {
      ignore = true;
    };
  }, [adminToken, membersPage, membersSearch, membersStatus, membersSortBy, membersSortOrder, fetchMembers]);

  const handleSortMembers = (field: "displayName" | "xHandle" | "stamps" | "passes") => {
    if (membersSortBy === field) {
      setMembersSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setMembersSortBy(field);
      setMembersSortOrder(field === "displayName" || field === "xHandle" ? "asc" : "desc");
    }
  };

  const openAdjustModal = (user: AdminMember) => {
    setAdjustModalUser(user);
    setAdjustMode("ADD");
    setAdjustAmount(1);
    setAdjustReason("");
  };

  const closeAdjustModal = () => {
    setAdjustModalUser(null);
  };

  const handleAdjustStamps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;

    if (!adjustAmount || adjustAmount <= 0) {
      toast.error("กรุณาระบุจำนวนแต้มอย่างน้อย 1 แต้ม");
      return;
    }

    if (adjustMode === "DEDUCT" && adjustAmount > adjustModalUser.stamps) {
      toast.error(
        `ไม่สามารถลดแต้มเกินจำนวนที่มีอยู่ได้ (ปัจจุบันมี ${adjustModalUser.stamps} แต้ม)`,
      );
      return;
    }

    const finalAmount = adjustMode === "ADD" ? adjustAmount : -adjustAmount;
    setAdjustSubmitting(true);

    try {
      const res = await adminFetch("/api/admin/members", {
        method: "POST",
        token: adminToken,
        json: {
          userId: adjustModalUser.id,
          amount: finalAmount,
          reason:
            adjustReason.trim() ||
            (adjustMode === "ADD" ? "เพิ่มแต้มโดยแอดมิน" : "ลดแต้มโดยแอดมิน"),
        },
      });

      if (res.ok) {
        toast.success(
          adjustMode === "ADD"
            ? `เพิ่ม ${adjustAmount} แต้มเรียบร้อยแล้ว`
            : `ลด ${adjustAmount} แต้มเรียบร้อยแล้ว`,
        );
        closeAdjustModal();
        await fetchMembers();
        if (onRefreshAll) await onRefreshAll();
      } else {
        const err = await res.json();
        toast.error(err.error || "ปรับแต้มไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const openEditAdmin = (admin: { id: string; name: string; role?: string }) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.name);
    setShowEditAdminModal(true);
  };

  const closeEditAdminModal = () => {
    setShowEditAdminModal(false);
    setEditingAdmin(null);
    setEditAdminName("");
  };

  const handleSaveAdminName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdminName.trim()) {
      toast.error("กรุณาระบุชื่อแอดมิน");
      return;
    }

    if (editingAdmin?.role === "DEV" && adminProfile?.role !== "DEV") {
      toast.error("ไม่อนุญาตให้แก้ไขชื่อบัญชี Developer");
      return;
    }

    setSavingEditAdmin(true);
    try {
      const isSelf = editingAdmin?.id === adminProfile?.id;
      if (isSelf) {
        const res = await adminFetch("/api/admin/profile", {
          method: "PATCH",
          token: adminToken,
          json: { name: editAdminName.trim() },
        });

        if (res.ok) {
          const data = await res.json();
          if (onProfileUpdate) onProfileUpdate(data.admin);
          localStorage.setItem("lele_admin_profile", JSON.stringify(data.admin));
          toast.success("แก้ไขชื่อแอดมินเรียบร้อยแล้ว");
          closeEditAdminModal();
          fetchMembers();
        } else {
          const err = await res.json();
          toast.error(err.error || "แก้ไขชื่อไม่สำเร็จ");
        }
      } else if (editingAdmin) {
        const res = await adminFetch("/api/admin/members", {
          method: "PATCH",
          token: adminToken,
          json: {
            adminId: editingAdmin.id,
            name: editAdminName.trim(),
          },
        });

        if (res.ok) {
          toast.success("แก้ไขชื่อแอดมินเรียบร้อยแล้ว");
          closeEditAdminModal();
          fetchMembers();
        } else {
          const err = await res.json();
          toast.error(err.error || "แก้ไขชื่อไม่สำเร็จ");
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingEditAdmin(false);
    }
  };

  const executeDeleteAdmin = async (adminId: string) => {
    try {
      const res = await adminFetch(`/api/admin/members?adminId=${adminId}`, {
        method: "DELETE",
        token: adminToken,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `ลบบัญชีแอดมินเรียบร้อยแล้ว`);
        await fetchMembers();
        if (onRefreshAll) await onRefreshAll();
        return true;
      } else {
        toast.error(data.error || "ลบบัญชีแอดมินไม่สำเร็จ");
        return false;
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      return false;
    }
  };

  const openNewAdmin = () => {
    setNewAdminEmail("");
    setNewAdminName("");
    setNewAdminPasswordMode("DEFAULT");
    setNewAdminPassword("");
    setShowNewAdminModal(true);
  };

  const closeNewAdminModal = () => {
    setShowNewAdminModal(false);
    setNewAdminEmail("");
    setNewAdminName("");
    setNewAdminPasswordMode("DEFAULT");
    setNewAdminPassword("");
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPasswordMode === "CUSTOM") {
      const pwd = newAdminPassword.trim();
      if (pwd.length < 8) {
        toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
        return;
      }
      if (!/[a-zA-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
        toast.error("รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษและตัวเลข");
        return;
      }
    }

    setSavingNewAdmin(true);
    try {
      const res = await adminFetch("/api/admin/create-admin", {
        method: "POST",
        token: adminToken,
        json: {
          email: newAdminEmail.trim().toLowerCase(),
          name: newAdminName.trim(),
          password: newAdminPasswordMode === "CUSTOM" ? newAdminPassword.trim() : undefined,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "สร้างบัญชีแอดมินสำเร็จ");
        closeNewAdminModal();
        await fetchMembers();
        if (onRefreshAll) await onRefreshAll();
      } else {
        toast.error(data.error || "สร้างบัญชีแอดมินไม่สำเร็จ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingNewAdmin(false);
    }
  };

  return {
    membersSubTab,
    setMembersSubTab: handleSubTabChange,
    customersTotal,
    adminsTotal,
    members,
    membersTotal,
    membersPage,
    membersTotalPages,
    membersSearch,
    membersStatus,
    membersSortBy,
    membersSortOrder,
    membersLoading,
    adjustModalUser,
    adjustMode,
    adjustAmount,
    adjustReason,
    adjustSubmitting,
    showEditAdminModal,
    editingAdmin,
    editAdminName,
    savingEditAdmin,
    showNewAdminModal,
    newAdminEmail,
    newAdminName,
    newAdminPasswordMode,
    newAdminPassword,
    savingNewAdmin,
    setMembersPage,
    setMembersSearch,
    setAdjustMode,
    setAdjustAmount,
    setAdjustReason,
    setEditAdminName,
    setNewAdminEmail,
    setNewAdminName,
    setNewAdminPasswordMode,
    setNewAdminPassword,
    handleSortMembers,
    openAdjustModal,
    closeAdjustModal,
    handleAdjustStamps,
    openEditAdmin,
    closeEditAdminModal,
    handleSaveAdminName,
    executeDeleteAdmin,
    openNewAdmin,
    closeNewAdminModal,
    handleCreateAdmin,
    fetchMembers,
  };
}

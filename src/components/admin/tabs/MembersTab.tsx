"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Copy, Pencil, Trash2, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import { getMemberTier } from "@/lib/tier";
import AdminFilterBar from "../AdminFilterBar";
import AdminDataTable, { ColumnDef } from "../AdminDataTable";
import ManageMemberModal from "../modals/ManageMemberModal";
import EditAdminModal from "../modals/EditAdminModal";
import NewAdminModal from "../modals/NewAdminModal";
import { AdminMember, AdminProfile, ConfirmModalConfig } from "../types";

export interface MembersTabProps {
  membersSubTab: "CUSTOMERS" | "ADMINS";
  onSubTabChange: (tab: "CUSTOMERS" | "ADMINS") => void;
  customersTotal: number;
  adminsTotal: number;
  members: AdminMember[];
  membersTotal: number;
  membersPage: number;
  membersTotalPages: number;
  membersSearch: string;
  membersSortBy: "displayName" | "xHandle" | "stamps" | "passes" | "";
  membersSortOrder: "asc" | "desc";
  membersLoading: boolean;
  membersTierFilter: string;
  onTierFilterChange: (tier: string) => void;
  adminProfile: AdminProfile | null;
  adjustModalUser: AdminMember | null;
  adjustMode: "ADD" | "DEDUCT";
  adjustAmount: number;
  adjustReason: string;
  adjustSubmitting: boolean;
  tierModalUser: AdminMember | null;
  adjustTier: string;
  tierReason: string;
  tierSubmitting: boolean;
  showEditAdminModal: boolean;
  editingAdmin: { id: string; name: string; role?: string } | null;
  editAdminName: string;
  savingEditAdmin: boolean;
  showNewAdminModal: boolean;
  newAdminEmail: string;
  newAdminName: string;
  newAdminPasswordMode: "DEFAULT" | "CUSTOM";
  newAdminPassword: string;
  savingNewAdmin: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onSort: (field: "displayName" | "xHandle" | "stamps" | "passes") => void;
  onOpenAdjust: (member: AdminMember) => void;
  onCloseAdjust: () => void;
  onAdjustModeChange: (mode: "ADD" | "DEDUCT") => void;
  onAdjustAmountChange: React.Dispatch<React.SetStateAction<number>>;
  onAdjustReasonChange: (reason: string) => void;
  onAdjustSubmit: (e: React.FormEvent) => void;
  onOpenTier: (member: AdminMember) => void;
  onCloseTier: () => void;
  onAdjustTierChange: (tier: string) => void;
  onTierReasonChange: (reason: string) => void;
  onTierSubmit: (e: React.FormEvent) => void;
  onOpenEditAdmin: (admin: { id: string; name: string; role?: string }) => void;
  onCloseEditAdmin: () => void;
  onEditAdminNameChange: (name: string) => void;
  onSaveAdminName: (e: React.FormEvent) => void;
  onDeleteAdmin: (adminId: string) => Promise<boolean>;
  onOpenNewAdmin: () => void;
  onCloseNewAdmin: () => void;
  onNewAdminEmailChange: (email: string) => void;
  onNewAdminNameChange: (name: string) => void;
  onNewAdminPasswordModeChange: (mode: "DEFAULT" | "CUSTOM") => void;
  onNewAdminPasswordChange: (val: string) => void;
  onCreateAdmin: (e: React.FormEvent) => void;
  openConfirmModal: (config: ConfirmModalConfig) => void;
}

export default function MembersTab({
  membersSubTab,
  onSubTabChange,
  customersTotal,
  adminsTotal,
  members,
  membersTotal,
  membersPage,
  membersTotalPages,
  membersSearch,
  membersSortBy,
  membersSortOrder,
  membersLoading,
  membersTierFilter,
  onTierFilterChange,
  adminProfile,
  adjustModalUser,
  adjustMode,
  adjustAmount,
  adjustReason,
  adjustSubmitting,
  tierModalUser,
  adjustTier,
  tierReason,
  tierSubmitting,
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
  onPageChange,
  onSearchChange,
  onSort,
  onOpenAdjust,
  onCloseAdjust,
  onAdjustModeChange,
  onAdjustAmountChange,
  onAdjustReasonChange,
  onAdjustSubmit,
  onOpenTier,
  onCloseTier,
  onAdjustTierChange,
  onTierReasonChange,
  onTierSubmit,
  onOpenEditAdmin,
  onCloseEditAdmin,
  onEditAdminNameChange,
  onSaveAdminName,
  onDeleteAdmin,
  onOpenNewAdmin,
  onCloseNewAdmin,
  onNewAdminEmailChange,
  onNewAdminNameChange,
  onNewAdminPasswordModeChange,
  onNewAdminPasswordChange,
  onCreateAdmin,
  openConfirmModal,
}: MembersTabProps) {
  const [manageUser, setManageUser] = useState<AdminMember | null>(null);

  const handleOpenManage = useCallback(
    (member: AdminMember) => {
      onOpenAdjust(member);
      onOpenTier(member);
      setManageUser(member);
    },
    [onOpenAdjust, onOpenTier],
  );

  const handleCloseManage = useCallback(() => {
    onCloseAdjust();
    onCloseTier();
    setManageUser(null);
  }, [onCloseAdjust, onCloseTier]);
  const promptDeleteAdmin = useCallback(
    (adminId: string, adminName: string, adminEmail: string) => {
      openConfirmModal({
        title: "ยืนยันการลบบัญชีแอดมิน",
        message: `คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีแอดมิน "${adminName}" (${adminEmail})? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
        confirmText: "ลบบัญชี",
        isDestructive: true,
        onConfirm: async () => {
          await onDeleteAdmin(adminId);
        },
      });
    },
    [openConfirmModal, onDeleteAdmin],
  );

  const memberColumns: ColumnDef<AdminMember>[] = useMemo(() => {
    if (membersSubTab === "ADMINS") {
      return [
        {
          key: "displayName",
          header: "ชื่อแอดมิน",
          sortable: true,
          className: "font-semibold text-[#25384C] whitespace-nowrap",
          render: (m) => (
            <div className="flex items-center gap-2.5">
              {m.avatarUrl ? (
                <Image
                  src={m.avatarUrl}
                  alt={m.displayName}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full object-cover border border-[#D0DEF7] shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#D0DEF7]/40 border border-[#D0DEF7] flex items-center justify-center text-xs font-bold text-[#25384C] shrink-0 shadow-2xs">
                  {m.displayName?.slice(0, 2).toUpperCase() || "MB"}
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="leading-tight">{m.displayName}</span>
                {!(m.role === "DEV" && adminProfile?.role !== "DEV") && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenEditAdmin({
                        id: m.id,
                        name: m.displayName,
                        role: m.role,
                      })
                    }
                    title="คลิกเพื่อแก้ไขชื่อแอดมิน"
                    className="w-5 h-5 rounded-md hover:bg-[#D0DEF7]/40 text-slate-400 hover:text-[#25384C] border border-transparent hover:border-[#D0DEF7] inline-flex items-center justify-center transition cursor-pointer active:scale-95"
                  >
                    <Pencil className="w-2.5 h-2.5 shrink-0" />
                  </button>
                )}
                {m.isAdmin && m.id === adminProfile?.id && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    (คุณ)
                  </span>
                )}
                {m.isAdmin && m.role === "DEV" && (
                  <span className="text-[9.5px] font-mono font-bold text-[#315F91] bg-[#D0DEF7]/40 border border-[#D0DEF7] px-1.5 py-0.5 rounded-full">
                    DEV
                  </span>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "xHandle",
          header: "อีเมล",
          sortable: true,
          className: "text-slate-600 whitespace-nowrap",
          render: (m) => (
            <span className="text-xs text-slate-700 font-latin">
              {m.xHandle}
            </span>
          ),
        },
        {
          key: "actions",
          header: "การจัดการ",
          align: "right",
          className: "whitespace-nowrap",
          render: (m) => (
            <div className="flex items-center justify-end">
              {m.id !== adminProfile?.id &&
              m.role !== "DEV" &&
              (adminProfile?.role === "DEV" ||
                adminProfile?.role === "OWNER") ? (
                <button
                  type="button"
                  onClick={() =>
                    promptDeleteAdmin(m.id, m.displayName, m.xHandle || "")
                  }
                  title="ลบสิทธิ์แอดมิน"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#B01444] hover:text-[#800C30] bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-lg font-medium transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <Trash2 className="w-3 h-3 shrink-0" />
                  <span>ลบ</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 pr-2">-</span>
              )}
            </div>
          ),
        },
      ];
    }

    return [
      {
        key: "displayName",
        header: "สมาชิก",
        sortable: true,
        className: "font-semibold text-[#25384C] whitespace-nowrap",
        render: (m) => {
          const t = getMemberTier(m);
          return (
            <div className="flex items-center gap-2.5">
              {/* Avatar with Tier Frame Overlay (Enlarged to 40px for crystal-clear avatar visibility) */}
              <div className="relative shrink-0 flex items-center justify-center w-10 h-10">
                <div
                  className="absolute rounded-full overflow-hidden bg-[#FAF8F2] z-0 shadow-inner"
                  style={{
                    top: t.avatarMetrics.top,
                    left: t.avatarMetrics.left,
                    width: t.avatarMetrics.size,
                    height: t.avatarMetrics.size,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {m.avatarUrl ? (
                    <Image
                      src={m.avatarUrl}
                      alt={m.displayName}
                      fill
                      unoptimized
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#25384C]">
                      {m.displayName?.slice(0, 2).toUpperCase() || "MB"}
                    </div>
                  )}
                </div>

                {t.frameImage && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <Image
                      src={t.frameImage}
                      alt={t.label}
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-contain pointer-events-none select-none drop-shadow-xs"
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="leading-tight font-semibold text-[#25384C] block truncate max-w-32.5 sm:max-w-40">
                    {m.displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(m.id);
                    toast.success(`คัดลอก Member ID แล้ว (${m.displayName})`);
                  }}
                  title="คลิกเพื่อคัดลอก Member ID"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-[#315F91] hover:underline cursor-pointer transition mt-0.5"
                >
                  <span>
                    #
                    {m.id && m.id.length > 8
                      ? `${m.id.slice(0, 4)}...${m.id.slice(-4)}`
                      : m.id}
                  </span>
                  <Copy className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </button>
              </div>
            </div>
          );
        },
      },

      {
        key: "xHandle",
        header: "บัญชี X",
        sortable: true,
        className: "text-slate-600 whitespace-nowrap",
        render: (m) =>
          m.xHandle ? (
            <a
              href={`https://x.com/${m.xHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#315F91] hover:underline font-latin"
            >
              @{m.xHandle}
            </a>
          ) : (
            "-"
          ),
      },
      {
        key: "stamps",
        header: "แต้มสะสม",
        sortable: true,
        className: "whitespace-nowrap",
        render: (m) => {
          const totalPoints = Math.max(m.lifetimeStamps ?? 0, m.stamps);
          return (
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-1.5">
                <span className="font-bold text-[#25384C] text-sm">
                  {m.stamps}
                </span>{" "}
                <span className="text-slate-500 text-xs">แต้ม</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                สะสมทั้งหมด {totalPoints} แต้ม
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "การจัดการ",
        align: "right",
        className: "whitespace-nowrap",
        render: (m) => (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => handleOpenManage(m)}
              title="จัดการสมาชิก (ปรับแต้ม / ปรับระดับ)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#25384C] hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer shadow-2xs active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ];
  }, [
    membersSubTab,
    adminProfile?.id,
    adminProfile?.role,
    onOpenEditAdmin,
    promptDeleteAdmin,
    handleOpenManage,
  ]);

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#D0DEF7] pb-2 text-xs">
        <button
          type="button"
          onClick={() => onSubTabChange("CUSTOMERS")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            membersSubTab === "CUSTOMERS"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>ข้อมูลลูกค้า</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              membersSubTab === "CUSTOMERS"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {customersTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("ADMINS")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            membersSubTab === "ADMINS"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>จัดการแอดมิน</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              membersSubTab === "ADMINS"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {adminsTotal}
          </span>
        </button>
      </div>

      <AdminFilterBar
        searchPlaceholder={
          membersSubTab === "ADMINS"
            ? "ค้นหาชื่อ หรืออีเมลแอดมิน..."
            : "ค้นหาด้วยชื่อ, บัญชี X หรือเบอร์โทร..."
        }
        searchQuery={membersSearch}
        onSearchChange={onSearchChange}
        isLoading={membersLoading}
        filterOptions={
          membersSubTab === "CUSTOMERS"
            ? [
                { value: "ALL", label: "ทุกระดับ" },
                { value: "BRONZE", label: "Bronze" },
                { value: "SILVER", label: "Silver" },
                { value: "GOLD", label: "Gold" },
                { value: "PLATINUM", label: "Platinum" },
                { value: "DIAMOND", label: "Diamond" },
              ]
            : undefined
        }
        filterValue={membersTierFilter}
        onFilterChange={onTierFilterChange}
        filterLabel="ระดับ"
        actionButton={
          membersSubTab === "ADMINS" &&
          (adminProfile?.role === "DEV" || adminProfile?.role === "OWNER") ? (
            <button
              type="button"
              onClick={onOpenNewAdmin}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] transition cursor-pointer whitespace-nowrap"
            >
              เพิ่มแอดมินใหม่
            </button>
          ) : undefined
        }
      />

      <AdminDataTable<AdminMember>
        columns={memberColumns}
        data={members}
        keyExtractor={(m) => m.id}
        isLoading={membersLoading}
        emptyMessage={
          membersSubTab === "ADMINS" ? "ไม่พบข้อมูลแอดมิน" : "ไม่พบข้อมูลสมาชิก"
        }
        sortBy={membersSortBy}
        sortOrder={membersSortOrder}
        onSort={(field) =>
          onSort(field as "displayName" | "xHandle" | "stamps")
        }
        page={membersPage}
        totalPages={membersTotalPages}
        totalItems={membersTotal}
        onPageChange={onPageChange}
      />

      {/* Manage Member Modal (Adjust Stamps & Tier) */}
      <ManageMemberModal
        user={manageUser || adjustModalUser || tierModalUser}
        onClose={handleCloseManage}
        adjustMode={adjustMode}
        setAdjustMode={onAdjustModeChange}
        adjustAmount={adjustAmount}
        setAdjustAmount={onAdjustAmountChange}
        adjustReason={adjustReason}
        setAdjustReason={onAdjustReasonChange}
        adjustSubmitting={adjustSubmitting}
        onAdjustSubmit={onAdjustSubmit}
        adjustTier={adjustTier}
        setAdjustTier={onAdjustTierChange}
        tierReason={tierReason}
        setTierReason={onTierReasonChange}
        tierSubmitting={tierSubmitting}
        onTierSubmit={onTierSubmit}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={showEditAdminModal}
        onClose={onCloseEditAdmin}
        editingAdmin={
          editingAdmin
            ? {
                id: editingAdmin.id,
                displayName: editingAdmin.name,
                role: editingAdmin.role,
                createdAt: "",
                stamps: 0,
                _count: { reviews: 0, passes: 0 },
              }
            : null
        }
        adminProfile={adminProfile}
        adminName={editAdminName}
        setAdminName={onEditAdminNameChange}
        saving={savingEditAdmin}
        onSave={onSaveAdminName}
      />

      {/* New Admin Modal */}
      <NewAdminModal
        isOpen={showNewAdminModal}
        onClose={onCloseNewAdmin}
        email={newAdminEmail}
        setEmail={onNewAdminEmailChange}
        name={newAdminName}
        setName={onNewAdminNameChange}
        passwordMode={newAdminPasswordMode}
        setPasswordMode={onNewAdminPasswordModeChange}
        password={newAdminPassword}
        setPassword={onNewAdminPasswordChange}
        saving={savingNewAdmin}
        onSubmit={onCreateAdmin}
      />
    </div>
  );
}

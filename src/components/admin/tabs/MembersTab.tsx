"use client";

import React, { useCallback, useMemo } from "react";
import Image from "next/image";
import AdminFilterBar from "../AdminFilterBar";
import AdminDataTable, { ColumnDef } from "../AdminDataTable";
import AdjustStampsModal from "../modals/AdjustStampsModal";
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
  adminProfile: AdminProfile | null;
  adjustModalUser: AdminMember | null;
  adjustMode: "ADD" | "DEDUCT";
  adjustAmount: number;
  adjustReason: string;
  adjustSubmitting: boolean;
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
  adminProfile,
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
  onPageChange,
  onSearchChange,
  onSort,
  onOpenAdjust,
  onCloseAdjust,
  onAdjustModeChange,
  onAdjustAmountChange,
  onAdjustReasonChange,
  onAdjustSubmit,
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
            <div className="flex items-center gap-2">
              {m.avatarUrl ? (
                <Image
                  src={m.avatarUrl}
                  alt={m.displayName}
                  width={28}
                  height={28}
                  unoptimized
                  className="w-7 h-7 rounded-full object-cover border border-[#D0DEF7] shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#D0DEF7]/40 flex items-center justify-center text-[10px] font-bold text-[#25384C]">
                  {m.displayName?.slice(0, 2).toUpperCase() || "MB"}
                </div>
              )}
              <span>{m.displayName}</span>
              {m.isAdmin && m.id === adminProfile?.id && (
                <span className="text-[10px] text-slate-400 font-normal">
                  (คุณ)
                </span>
              )}
              {m.isAdmin && m.role === "DEV" && (
                <span className="text-[10px] font-mono text-[#315F91] bg-[#D0DEF7]/40 px-1.5 py-0.5 rounded">
                  DEV
                </span>
              )}
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
            <div className="flex items-center justify-end gap-1.5">
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
                  className="px-2.5 py-1 text-xs bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] rounded-lg font-semibold transition cursor-pointer"
                >
                  แก้ไขชื่อ
                </button>
              )}
              {m.id !== adminProfile?.id &&
                m.role !== "DEV" &&
                (adminProfile?.role === "DEV" ||
                  adminProfile?.role === "OWNER") && (
                  <button
                    type="button"
                    onClick={() =>
                      promptDeleteAdmin(
                        m.id,
                        m.displayName,
                        m.xHandle || "",
                      )
                    }
                    className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-[#B01444] border border-rose-200 rounded-lg font-semibold transition cursor-pointer"
                  >
                    ลบ
                  </button>
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
        render: (m) => (
          <div className="flex items-center gap-2">
            {m.avatarUrl ? (
              <Image
                src={m.avatarUrl}
                alt={m.displayName}
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 rounded-full object-cover border border-[#D0DEF7] shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#D0DEF7]/40 flex items-center justify-center text-[10px] font-bold text-[#25384C]">
                {m.displayName?.slice(0, 2).toUpperCase() || "MB"}
              </div>
            )}
            <span>{m.displayName}</span>
          </div>
        ),
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
        header: "แต้มปัจจุบัน",
        sortable: true,
        className: "whitespace-nowrap",
        render: (m) => (
          <>
            <span className="font-bold text-[#25384C] text-sm">{m.stamps}</span>{" "}
            <span className="text-slate-500 text-xs">แต้ม</span>
          </>
        ),
      },
      {
        key: "actions",
        header: "การจัดการ",
        align: "right",
        className: "whitespace-nowrap",
        render: (m) => (
          <button
            type="button"
            onClick={() => onOpenAdjust(m)}
            className="px-2.5 py-1 text-xs bg-[#FAF8F2] hover:bg-[#D0DEF7]/40 text-[#25384C] border border-[#D0DEF7] rounded-lg font-semibold transition cursor-pointer"
          >
            ปรับแต้ม
          </button>
        ),
      },
    ];
  }, [
    membersSubTab,
    adminProfile?.id,
    adminProfile?.role,
    onOpenEditAdmin,
    promptDeleteAdmin,
    onOpenAdjust,
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

      {/* Adjust Stamps Modal */}
      <AdjustStampsModal
        user={adjustModalUser}
        onClose={onCloseAdjust}
        adjustMode={adjustMode}
        setAdjustMode={onAdjustModeChange}
        adjustAmount={adjustAmount}
        setAdjustAmount={onAdjustAmountChange}
        adjustReason={adjustReason}
        setAdjustReason={onAdjustReasonChange}
        submitting={adjustSubmitting}
        onSubmit={onAdjustSubmit}
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

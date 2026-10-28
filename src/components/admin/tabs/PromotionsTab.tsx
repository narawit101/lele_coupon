"use client";

import React from "react";
import AdminFilterBar from "../AdminFilterBar";
import AdminDataTable, { ColumnDef } from "../AdminDataTable";
import PromoModal from "../modals/PromoModal";
import SpecialCodeModal from "../modals/SpecialCodeModal";
import { AdminPromotion, AdminSpecialCode, ConfirmModalConfig } from "../types";
import { formatThaiDateTime } from "@/lib/date";

export interface PromotionsTabProps {
  promotionsSubTab: "PROMOTIONS" | "SPECIAL_CODES";
  onSubTabChange: (tab: "PROMOTIONS" | "SPECIAL_CODES") => void;

  // Regular Promotions
  promotions: AdminPromotion[];
  promotionsTotal: number;
  promotionsPage: number;
  promotionsTotalPages: number;
  promotionsSearch: string;
  promotionsStatus: string;
  promotionsSortBy: "title" | "points" | "redeemed" | "status" | "";
  promotionsSortOrder: "asc" | "desc";
  promotionsLoading: boolean;
  showPromoModal: boolean;
  editingPromo: AdminPromotion | null;
  promoTitle: string;
  setPromoTitle: (val: string) => void;
  promoPoints: string;
  setPromoPoints: (val: string) => void;
  promoDesc: string;
  setPromoDesc: (val: string) => void;
  promoActive: boolean;
  setPromoActive: React.Dispatch<React.SetStateAction<boolean>>;
  savingPromo: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSort: (field: "title" | "points" | "redeemed" | "status") => void;
  onOpenCreate: () => void;
  onOpenEdit: (promo: AdminPromotion) => void;
  onCloseModal: () => void;
  onSavePromotion: (e: React.FormEvent) => void;
  onDeletePromotion: (id: string, title: string) => void;

  // Special Codes
  specialCodes: AdminSpecialCode[];
  specialCodesTotal: number;
  codesLoading: boolean;
  codesSearch: string;
  onCodesSearchChange: (search: string) => void;
  codesStatus: string;
  onCodesStatusChange: (status: string) => void;
  codesPage: number;
  codesTotalPages: number;
  onCodesPageChange: (page: number) => void;
  codesSortBy: "code" | "reward" | "quota" | "expiresAt" | "status" | "";
  codesSortOrder: "asc" | "desc";
  onCodesSort: (field: string) => void;
  showCreateCodeModal: boolean;
  editingCode: AdminSpecialCode | null;
  newCodeName: string;
  onCodeNameChange: (val: string) => void;
  newCodeRewardType: "PASS" | "POINTS";
  onRewardTypeChange: (val: "PASS" | "POINTS") => void;
  newCodePoints: string;
  onRewardPointsChange: (val: string) => void;
  newCodeTitle: string;
  onRewardTitleChange: (val: string) => void;
  newCodeMaxUses: string;
  onMaxUsesChange: (val: string) => void;
  newCodeExpiresAt: string;
  onExpiresAtChange: (val: string) => void;
  codeActive: boolean;
  setCodeActive: React.Dispatch<React.SetStateAction<boolean>>;
  savingNewCode: boolean;
  onOpenCreateCode: () => void;
  onOpenEditCode: (code: AdminSpecialCode) => void;
  onCloseCreateCode: () => void;
  onSaveNewCode: (e: React.FormEvent) => void;
  onToggleCodeActive: (code: AdminSpecialCode) => void;
  onDeleteCode: (code: AdminSpecialCode) => void;

  openConfirmModal: (config: ConfirmModalConfig) => void;
  currentTime?: number;
}

export default function PromotionsTab({
  promotionsSubTab,
  onSubTabChange,
  promotions,
  promotionsTotal,
  promotionsPage,
  promotionsTotalPages,
  promotionsSearch,
  promotionsStatus,
  promotionsSortBy,
  promotionsSortOrder,
  promotionsLoading,
  showPromoModal,
  editingPromo,
  promoTitle,
  setPromoTitle,
  promoPoints,
  setPromoPoints,
  promoDesc,
  setPromoDesc,
  promoActive,
  setPromoActive,
  savingPromo,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onSort,
  onOpenCreate,
  onOpenEdit,
  onCloseModal,
  onSavePromotion,
  onDeletePromotion,
  specialCodes,
  specialCodesTotal,
  codesLoading,
  codesSearch,
  onCodesSearchChange,
  codesStatus,
  onCodesStatusChange,
  codesPage,
  codesTotalPages,
  onCodesPageChange,
  codesSortBy,
  codesSortOrder,
  onCodesSort,
  showCreateCodeModal,
  editingCode,
  newCodeName,
  onCodeNameChange,
  newCodeRewardType,
  onRewardTypeChange,
  newCodePoints,
  onRewardPointsChange,
  newCodeTitle,
  onRewardTitleChange,
  newCodeMaxUses,
  onMaxUsesChange,
  newCodeExpiresAt,
  onExpiresAtChange,
  codeActive,
  setCodeActive,
  savingNewCode,
  onOpenCreateCode,
  onOpenEditCode,
  onCloseCreateCode,
  onSaveNewCode,
  onDeleteCode,
  openConfirmModal,
  currentTime,
}: PromotionsTabProps) {
  const promptDeletePromo = (id: string, title: string) => {
    openConfirmModal({
      title: "ยืนยันการลบโปรโมชั่น",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่น "${title}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmText: "ลบโปรโมชั่น",
      isDestructive: true,
      onConfirm: async () => {
        onDeletePromotion(id, title);
      },
    });
  };

  const promptDeleteCode = (codeItem: AdminSpecialCode) => {
    openConfirmModal({
      title: "ยืนยันการลบโค้ดพิเศษ",
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบโค้ด "${codeItem.code}"? การลบโค้ดจะทำให้ประวัติการใช้โค้ดนี้ถูกลบไปด้วย`,
      confirmText: "ลบโค้ด",
      isDestructive: true,
      onConfirm: async () => {
        onDeleteCode(codeItem);
      },
    });
  };

  // Columns for regular Promotions table
  const promotionColumns: ColumnDef<AdminPromotion>[] = [
    {
      key: "title",
      header: "โปรโมชั่น / ของรางวัล",
      sortable: true,
      render: (promo) => (
        <div className="max-w-60 sm:max-w-[320px]">
          <span
            className="font-bold text-sm text-[#25384C] block truncate"
            title={promo.title}
          >
            {promo.title}
          </span>
          {promo.description && (
            <p
              className="text-[11px] text-slate-500 mt-0.5 truncate block"
              title={promo.description}
            >
              {promo.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "points",
      header: "แต้มที่ใช้",
      sortable: true,
      className: "whitespace-nowrap",
      render: (promo) => (
        <span className="font-semibold text-xs text-[#25384C]">
          {promo.points} แต้ม
        </span>
      ),
    },
    {
      key: "redeemed",
      header: "แลกแล้ว",
      sortable: true,
      className: "whitespace-nowrap",
      render: (promo) => (
        <span className="text-slate-600 font-medium">
          {promo._count?.passes || 0} ครั้ง
        </span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      sortable: true,
      className: "whitespace-nowrap",
      render: (promo) =>
        promo.isActive ? (
          <span className="text-xs font-semibold text-[#2D7058]">
            เปิดใช้งาน
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            ปิดใช้งาน
          </span>
        ),
    },
  ];

  // Columns for Special Codes table (Click row to edit, all columns sortable, no action column)
  const specialCodeColumns: ColumnDef<AdminSpecialCode>[] = [
    {
      key: "code",
      header: "รหัสโค้ด",
      sortable: true,
      render: (c) => (
        <span className="font-mono font-bold text-[#25384C]">{c.code}</span>
      ),
    },
    {
      key: "reward",
      header: "ประเภท & ของรางวัล",
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-800">{c.rewardTitle}</div>
          <div className="text-[11px] text-slate-500 font-latin">
            {c.rewardType === "PASS" ? "อื่นๆ" : "แต้มสะสม"}
          </div>
        </div>
      ),
    },
    {
      key: "quota",
      header: "โควต้าการใช้งาน",
      sortable: true,
      className: "whitespace-nowrap",
      render: (c) => {
        const isQuotaFull =
          c.maxUses !== null &&
          c.maxUses !== undefined &&
          c.usedCount >= c.maxUses;
        return (
          <div>
            <span
              className={`font-latin font-bold ${
                isQuotaFull ? "text-[#B01444]" : "text-[#25384C]"
              }`}
            >
              {c.usedCount}
            </span>
            <span
              className={`font-latin ${
                isQuotaFull ? "text-[#B01444]/70" : "text-slate-400"
              }`}
            >
              {" "}
              /{" "}
              {c.maxUses !== null && c.maxUses !== undefined
                ? c.maxUses
                : "ไม่จำกัด"}
            </span>
          </div>
        );
      },
    },
    {
      key: "expiresAt",
      header: "วันหมดอายุ",
      sortable: true,
      className: "whitespace-nowrap",
      render: (c) => {
        const isExpired =
          Boolean(currentTime && c.expiresAt) &&
          new Date(c.expiresAt!).getTime() < (currentTime ?? 0);
        return c.expiresAt ? (
          <span
            className={
              isExpired
                ? "text-[#B01444] font-semibold text-xs font-latin"
                : "text-slate-600 text-xs font-latin"
            }
          >
            {formatThaiDateTime(c.expiresAt)}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">ไม่มีกำหนด</span>
        );
      },
    },
    {
      key: "status",
      header: "สถานะ",
      sortable: true,
      className: "whitespace-nowrap",
      render: (c) => {
        const isExpired =
          Boolean(currentTime && c.expiresAt) &&
          new Date(c.expiresAt!).getTime() < (currentTime ?? 0);
        if (isExpired) {
          return (
            <span className="text-xs font-semibold text-[#B01444]">
              หมดอายุ
            </span>
          );
        }
        return c.isActive ? (
          <span className="text-xs font-semibold text-[#2D7058]">
            เปิดใช้งาน
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            ปิดใช้งาน
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#D0DEF7] pb-2 text-xs">
        <button
          type="button"
          onClick={() => onSubTabChange("PROMOTIONS")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            promotionsSubTab === "PROMOTIONS"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>โปรโมชั่น</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              promotionsSubTab === "PROMOTIONS"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {promotionsTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("SPECIAL_CODES")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            promotionsSubTab === "SPECIAL_CODES"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>โค้ดพิเศษ</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              promotionsSubTab === "SPECIAL_CODES"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {specialCodesTotal}
          </span>
        </button>
      </div>

      {promotionsSubTab === "PROMOTIONS" ? (
        <>
          <AdminFilterBar
            searchPlaceholder="ค้นหาชื่อโปรโมชั่น หรือคำอธิบาย..."
            searchQuery={promotionsSearch}
            onSearchChange={onSearchChange}
            isLoading={promotionsLoading}
            filterValue={promotionsStatus}
            onFilterChange={onStatusChange}
            filterOptions={[
              { label: "ทุกสถานะ", value: "ALL" },
              { label: "เปิดใช้งาน", value: "ACTIVE" },
              { label: "ปิดใช้งาน", value: "INACTIVE" },
            ]}
            actionButton={
              <button
                type="button"
                onClick={onOpenCreate}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] transition cursor-pointer whitespace-nowrap"
              >
                เพิ่มโปรโมชั่นใหม่
              </button>
            }
          />

          <AdminDataTable<AdminPromotion>
            columns={promotionColumns}
            data={promotions}
            keyExtractor={(p) => p.id}
            isLoading={promotionsLoading}
            emptyMessage="ไม่พบข้อมูลโปรโมชั่นในระบบ"
            sortBy={promotionsSortBy}
            sortOrder={promotionsSortOrder}
            onSort={(field) =>
              onSort(field as "title" | "points" | "redeemed" | "status")
            }
            page={promotionsPage}
            totalPages={promotionsTotalPages}
            totalItems={promotionsTotal}
            onPageChange={onPageChange}
            onRowClick={onOpenEdit}
            rowClassName={(p) =>
              !p.isActive ? "bg-slate-50/50 opacity-75" : ""
            }
          />
        </>
      ) : (
        <div className="space-y-4">
          <AdminFilterBar
            searchPlaceholder="ค้นหารหัสโค้ด หรือชื่อของรางวัล..."
            searchQuery={codesSearch}
            onSearchChange={onCodesSearchChange}
            isLoading={codesLoading}
            filterValue={codesStatus}
            onFilterChange={onCodesStatusChange}
            filterOptions={[
              { label: "ทุกสถานะ", value: "ALL" },
              { label: "เปิดใช้งาน", value: "ACTIVE" },
              { label: "ปิดใช้งาน", value: "INACTIVE" },
              { label: "หมดอายุ", value: "EXPIRED" },
            ]}
            filterLabel="สถานะ"
            actionButton={
              <button
                type="button"
                onClick={onOpenCreateCode}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#25384C] text-white hover:bg-[#1B2938] transition cursor-pointer whitespace-nowrap"
              >
                สร้างโค้ดพิเศษ
              </button>
            }
          />

          {/* Table: Special Codes List (Click row to edit, sortable headers) */}
          <AdminDataTable<AdminSpecialCode>
            columns={specialCodeColumns}
            data={specialCodes}
            keyExtractor={(c) => c.id}
            isLoading={codesLoading}
            emptyMessage='ยังไม่มีโค้ดพิเศษในระบบ กดปุ่ม "สร้างโค้ดพิเศษ" เพื่อเริ่มต้น'
            sortBy={codesSortBy}
            sortOrder={codesSortOrder}
            onSort={onCodesSort}
            page={codesPage}
            totalPages={codesTotalPages}
            totalItems={specialCodesTotal}
            pageSize={10}
            onPageChange={onCodesPageChange}
            onRowClick={onOpenEditCode}
            rowClassName={(c) =>
              !c.isActive ? "bg-slate-50/50 opacity-75" : ""
            }
          />
        </div>
      )}

      {/* Promotion Edit / Create Modal */}
      <PromoModal
        isOpen={showPromoModal}
        onClose={onCloseModal}
        editingPromo={editingPromo}
        promoTitle={promoTitle}
        setPromoTitle={setPromoTitle}
        promoPoints={promoPoints}
        setPromoPoints={setPromoPoints}
        promoDesc={promoDesc}
        setPromoDesc={setPromoDesc}
        promoActive={promoActive}
        setPromoActive={setPromoActive}
        savingPromo={savingPromo}
        onSave={onSavePromotion}
        onDelete={promptDeletePromo}
      />

      {/* Unified Special Code Create / Edit Modal */}
      <SpecialCodeModal
        isOpen={showCreateCodeModal}
        onClose={onCloseCreateCode}
        editingCode={editingCode}
        codeName={newCodeName}
        setCodeName={onCodeNameChange}
        rewardType={newCodeRewardType}
        setRewardType={onRewardTypeChange}
        rewardPoints={newCodePoints}
        setRewardPoints={onRewardPointsChange}
        rewardTitle={newCodeTitle}
        setRewardTitle={onRewardTitleChange}
        maxUses={newCodeMaxUses}
        setMaxUses={onMaxUsesChange}
        expiresAt={newCodeExpiresAt}
        setExpiresAt={onExpiresAtChange}
        codeActive={codeActive}
        setCodeActive={setCodeActive}
        saving={savingNewCode}
        onSubmit={onSaveNewCode}
        onDelete={promptDeleteCode}
        currentTime={currentTime}
      />
    </div>
  );
}

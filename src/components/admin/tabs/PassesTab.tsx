"use client";

import React from "react";
import AdminFilterBar from "../AdminFilterBar";
import AdminDataTable, { ColumnDef } from "../AdminDataTable";
import InspectPassModal from "../modals/InspectPassModal";
import { AdminPass, AdminCodeRedemption, ConfirmModalConfig } from "../types";
import { formatThaiDateTime } from "@/lib/date";

export interface PassesTabProps {
  passesSubTab: "PASSES" | "REDEMPTION_LOGS";
  onSubTabChange: (tab: "PASSES" | "REDEMPTION_LOGS") => void;

  // Regular Passes
  passes: AdminPass[];
  passesTotal: number;
  passesPage: number;
  passesTotalPages: number;
  passesSearch: string;
  passesStatus: string;
  passesSortBy: "code" | "reward" | "customer" | "createdAt" | "status" | "";
  passesSortOrder: "asc" | "desc";
  passesLoading: boolean;
  inspectingPass: AdminPass | null;
  passConcertInput: string;
  passActionLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSort: (
    field: "code" | "reward" | "customer" | "createdAt" | "status",
  ) => void;
  onOpenPassDetail: (pass: AdminPass) => void;
  onClosePassModal: () => void;
  onPassConcertInputChange: (val: string) => void;
  onExecutePassAction: (
    code: string,
    action: "USE" | "REVERT",
    concertName?: string,
  ) => Promise<boolean>;

  // Redemption Logs
  codeRedemptions: AdminCodeRedemption[];
  codeRedemptionsTotal: number;
  redemptionsLoading: boolean;
  redemptionsSearch: string;
  onRedemptionsSearchChange: (search: string) => void;
  redemptionsFilter: string;
  onRedemptionsFilterChange: (filter: string) => void;
  redemptionsPage: number;
  redemptionsTotalPages: number;
  onRedemptionsPageChange: (page: number) => void;
  redemptionsSortBy?: "createdAt" | "code" | "user" | "reward" | "";
  redemptionsSortOrder?: "asc" | "desc";
  onRedemptionsSort?: (field: string) => void;

  openConfirmModal?: (config: ConfirmModalConfig) => void;
}

export default function PassesTab({
  passesSubTab,
  onSubTabChange,
  passes,
  passesTotal,
  passesPage,
  passesTotalPages,
  passesSearch,
  passesStatus,
  passesSortBy,
  passesSortOrder,
  passesLoading,
  inspectingPass,
  passConcertInput,
  passActionLoading,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onSort,
  onOpenPassDetail,
  onClosePassModal,
  onPassConcertInputChange,
  onExecutePassAction,
  codeRedemptions,
  codeRedemptionsTotal,
  redemptionsLoading,
  redemptionsSearch,
  onRedemptionsSearchChange,
  redemptionsFilter,
  onRedemptionsFilterChange,
  redemptionsPage,
  redemptionsTotalPages,
  onRedemptionsPageChange,
  redemptionsSortBy = "",
  redemptionsSortOrder = "desc",
  onRedemptionsSort,
}: PassesTabProps) {
  const handleModalPassAction = async (action: "USE" | "REVERT") => {
    if (!inspectingPass) return;
    await onExecutePassAction(
      inspectingPass.code,
      action,
      action === "USE" ? passConcertInput.trim() || undefined : undefined,
    );
  };

  // Columns for Regular Passes table
  const passColumns: ColumnDef<AdminPass>[] = [
    {
      key: "code",
      header: "รหัสคูปอง",
      sortable: true,
      className: "whitespace-nowrap font-mono font-bold text-[#25384C]",
      render: (p) => p.code,
    },
    {
      key: "reward",
      header: "ของรางวัล",
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800">
            {p.rewardTitle || "สิทธิ์ลัดคิว"}
          </div>
          <div className="text-[11px] font-latin">
            {p.promotion?.points !== undefined &&
            p.promotion?.points !== null ? (
              <span className="text-slate-500">
                ใช้ {p.promotion.points} แต้ม
              </span>
            ) : (
              <span className="text-slate-400">โค้ดพิเศษ</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "ผู้ใช้งาน",
      sortable: true,
      className: "whitespace-nowrap",
      render: (p) => (
        <div>
          <span className="font-semibold text-slate-800">
            {p.user.displayName}
          </span>
          {p.user.xHandle && (
            <span className="text-slate-400 text-[11px] block mt-0.5">
              @{p.user.xHandle}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "วันเวลาที่ทำรายการ",
      sortable: true,
      className: "whitespace-nowrap text-slate-500 font-latin text-xs",
      render: (p) => formatThaiDateTime(p.createdAt),
    },
    {
      key: "status",
      header: "สถานะ",
      sortable: true,
      className: "whitespace-nowrap",
      render: (p) =>
        p.status === "ACTIVE" ? (
          <span className="text-xs font-semibold text-[#657406]">
            รอยืนยันสิทธิ์
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            ใช้งานแล้ว
          </span>
        ),
    },
  ];

  // Columns for Code Redemption Logs table (Ordered identically: Code -> Reward -> User -> Date)
  const redemptionColumns: ColumnDef<AdminCodeRedemption>[] = [
    {
      key: "code",
      header: "รหัสโค้ด",
      sortable: true,
      className: "whitespace-nowrap font-mono font-bold text-[#25384C]",
      render: (log) => log.code.code,
    },
    {
      key: "reward",
      header: "ของรางวัล",
      sortable: true,
      render: (log) => (
        <div>
          <div className="font-semibold text-slate-800">
            {log.code.rewardTitle}
          </div>
          <div className="text-[11px] font-latin">
            {log.code.rewardType === "PASS" ? (
              <span className="text-slate-500">อื่นๆ</span>
            ) : (
              <span className="text-slate-500">
                +{log.code.rewardPoints ?? 0} แต้มสะสม
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "ผู้ใช้งาน",
      sortable: true,
      className: "whitespace-nowrap",
      render: (log) => (
        <div>
          <span className="font-semibold text-slate-800">
            {log.user.displayName}
          </span>
          {log.user.xHandle && (
            <span className="text-slate-400 text-[11px] block mt-0.5">
              @{log.user.xHandle}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "วันเวลาที่ทำรายการ",
      sortable: true,
      className: "whitespace-nowrap font-latin text-xs text-slate-500",
      render: (log) => formatThaiDateTime(log.createdAt),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#D0DEF7] pb-2 text-xs">
        <button
          type="button"
          onClick={() => onSubTabChange("PASSES")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            passesSubTab === "PASSES"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>คูปองรางวัล</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              passesSubTab === "PASSES"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {passesTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("REDEMPTION_LOGS")}
          className={`px-3.5 py-1.5 rounded-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
            passesSubTab === "REDEMPTION_LOGS"
              ? "bg-[#25384C] text-white"
              : "bg-white text-slate-600 hover:bg-[#FAF8F2] border border-[#D0DEF7]"
          }`}
        >
          <span>ประวัติใช้โค้ดพิเศษ</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-latin ${
              passesSubTab === "REDEMPTION_LOGS"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {codeRedemptionsTotal}
          </span>
        </button>
      </div>

      {passesSubTab === "PASSES" ? (
        <>
          <AdminFilterBar
            searchPlaceholder="ค้นหารหัสคูปอง, ลูกค้า..."
            searchQuery={passesSearch}
            onSearchChange={onSearchChange}
            isLoading={passesLoading}
            filterValue={passesStatus}
            onFilterChange={onStatusChange}
            filterOptions={[
              { label: "ทุกสถานะ", value: "ALL" },
              { label: "รอยืนยันสิทธิ์", value: "ACTIVE" },
              { label: "ใช้งานแล้ว", value: "USED" },
            ]}
          />

          <AdminDataTable<AdminPass>
            columns={passColumns}
            data={passes}
            keyExtractor={(p) => p.id}
            isLoading={passesLoading}
            emptyMessage="ไม่พบข้อมูลคูปองในระบบ"
            sortBy={passesSortBy}
            sortOrder={passesSortOrder}
            onSort={(field) =>
              onSort(
                field as
                  | "code"
                  | "reward"
                  | "customer"
                  | "createdAt"
                  | "status",
              )
            }
            page={passesPage}
            totalPages={passesTotalPages}
            totalItems={passesTotal}
            onPageChange={onPageChange}
            onRowClick={onOpenPassDetail}
          />
        </>
      ) : (
        <div className="space-y-4">
          <AdminFilterBar
            searchPlaceholder="ค้นหารหัสโค้ด, ผู้ใช้งาน, หรือรางวัล..."
            searchQuery={redemptionsSearch}
            onSearchChange={onRedemptionsSearchChange}
            isLoading={redemptionsLoading}
            filterValue={redemptionsFilter}
            onFilterChange={onRedemptionsFilterChange}
            filterOptions={[
              { label: "ทุกประเภท", value: "ALL" },
              { label: "อื่นๆ", value: "PASS" },
              { label: "แต้มสะสม", value: "POINTS" },
            ]}
            filterLabel="ประเภท"
          />

          {/* Table: Redemption Log List */}
          <AdminDataTable<AdminCodeRedemption>
            columns={redemptionColumns}
            data={codeRedemptions}
            keyExtractor={(log) => log.id}
            isLoading={redemptionsLoading}
            emptyMessage="ยังไม่มีประวัติการกดใช้โค้ดในระบบ"
            sortBy={redemptionsSortBy}
            sortOrder={redemptionsSortOrder}
            onSort={onRedemptionsSort}
            page={redemptionsPage}
            totalPages={redemptionsTotalPages}
            totalItems={codeRedemptionsTotal}
            pageSize={10}
            onPageChange={onRedemptionsPageChange}
          />
        </div>
      )}

      {/* Detail Pass Modal */}
      <InspectPassModal
        pass={inspectingPass}
        onClose={onClosePassModal}
        isLoading={passActionLoading}
        passConcertInput={passConcertInput}
        onPassConcertInputChange={onPassConcertInputChange}
        onPassAction={handleModalPassAction}
      />
    </div>
  );
}

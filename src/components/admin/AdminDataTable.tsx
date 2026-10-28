"use client";

import React from "react";
import Pagination from "@/components/Pagination";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  // Pagination
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  minWidth?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  renderRow?: (item: T, index: number) => React.ReactNode;
  skeletonRowCount?: number;
}

export default function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "ไม่พบข้อมูลในระบบ",
  sortBy = "",
  sortOrder = "desc",
  onSort,
  page,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  minWidth = "min-w-[650px]",
  onRowClick,
  rowClassName,
  renderRow,
  skeletonRowCount = 5,
}: AdminDataTableProps<T>) {
  return (
    <div className="bg-white rounded-[20px] border border-[#D0DEF7] overflow-hidden shadow-sm">
      {/* Table Content with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className={`w-full text-xs text-left ${minWidth}`}>
          <thead className="bg-[#FAF8F2] border-b border-[#D0DEF7] text-[#25384C] font-semibold select-none">
            <tr>
              {columns.map((col) => {
                const isCurrentSort = sortBy === col.key;
                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left";

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    className={`px-4 py-3.5 whitespace-nowrap transition ${alignClass} ${
                      col.sortable
                        ? "cursor-pointer hover:bg-[#D0DEF7]/30"
                        : ""
                    } ${col.className || ""}`}
                    title={col.sortable ? `คลิกเพื่อจัดเรียงตาม ${col.key}` : undefined}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span
                          className={`text-[11px] font-latin ${
                            isCurrentSort ? "text-[#25384C] font-bold" : "text-slate-300"
                          }`}
                        >
                          {isCurrentSort ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody
            className={`divide-y divide-[#D0DEF7]/60 ${
              isLoading && data.length === 0 ? "pointer-events-none" : ""
            }`}
          >
            {isLoading && data.length === 0 ? (
              // Skeleton Loading Rows
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className="px-4 py-3.5">
                      <div
                        className={`h-4 bg-slate-200 rounded ${
                          cIdx === 0
                            ? "w-28"
                            : cIdx === columns.length - 1
                              ? "w-16 ml-auto"
                              : "w-20"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((item, index) => {
                if (renderRow) {
                  return renderRow(item, index);
                }

                const customClass =
                  typeof rowClassName === "function"
                    ? rowClassName(item)
                    : (rowClassName || "");

                return (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={`hover:bg-[#FAF8F2]/60 transition ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${customClass}`}
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left";

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3.5 ${alignClass} ${col.className || ""}`}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as Record<string, unknown>)[col.key]?.toString() ?? "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standardized Pagination Bottom Bar */}
      {totalPages !== undefined && totalPages > 1 && onPageChange && page !== undefined && (
        <div className="p-3.5 sm:p-4 border-t border-[#D0DEF7] bg-white">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems || data.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

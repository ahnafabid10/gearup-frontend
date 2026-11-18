"use client";

import { type ReactNode } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiInbox,
  FiAlertCircle,
} from "react-icons/fi";

export type ColumnDef<T> = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  cell?: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  retry?: () => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  search?: {
    value: string;
    placeholder?: string;
    onChange: (val: string) => void;
  };
};

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  error = "",
  emptyMessage,
  retry,
  pagination,
  search,
}: DataTableProps<T>) {
  return (
    <div className="dash-table-wrapper">
      {/* Search Header if provided */}
      {search && (
        <div className="dash-table-header-bar">
          <div className="dash-search-input-wrap">
            <FiSearch className="dash-search-icon" size={15} />
            <input
              type="text"
              className="dash-table-search"
              placeholder={search.placeholder || "Search entries…"}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
          <span className="dash-table-count">
            Showing {data.length} records
          </span>
        </div>
      )}

      {/* Primary Table with Dedicated In-Table States */}
      <div className="dash-table-card">
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align || "left",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Clean 5-row shimmering skeleton inside table
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="dash-skel-row">
                    {columns.map((col, cIdx) => (
                      <td key={`skel-${rIdx}-${col.key}`}>
                        <div
                          className="dash-skel-cell"
                          style={{
                            width:
                              cIdx === 0
                                ? "75%"
                                : cIdx === columns.length - 1
                                  ? "45%"
                                  : "60%",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                // Clean in-table error box
                <tr>
                  <td
                    colSpan={columns.length}
                    className="dash-table-state-cell"
                  >
                    <div className="dash-state-box error">
                      <FiAlertCircle
                        size={22}
                        className="dash-state-icon error"
                      />
                      <p className="dash-state-title">Unable to load records</p>
                      <small className="dash-state-msg">{error}</small>
                      {retry && (
                        <button
                          type="button"
                          className="dash-action-btn"
                          onClick={retry}
                          style={{ marginTop: "10px" }}
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : !data.length ? (
                // Clean in-table empty state
                <tr>
                  <td
                    colSpan={columns.length}
                    className="dash-table-state-cell"
                  >
                    <div className="dash-state-box empty">
                      <FiInbox size={32} className="dash-state-icon empty" />
                      <p className="dash-state-title">
                        {emptyMessage || "No records found in this view"}
                      </p>
                      <small className="dash-state-msg">
                        New bookings, listings, or payments will automatically
                        populate here.
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id ?? idx}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || "left" }}
                      >
                        {col.cell
                          ? col.cell(row)
                          : ((row as Record<string, unknown>)[
                              col.key
                            ] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="dash-pagination">
          <button
            type="button"
            className="dash-page-btn"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            <FiChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <span className="dash-page-indicator">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="dash-page-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            <span>Next</span>
            <FiChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

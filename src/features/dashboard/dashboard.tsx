"use client";

import { api, getRows } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { Badge } from "@/components/shared/badge";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { ReviewForm } from "@/features/reviews/review-form";
import { useState } from "react";

import Link from "next/link";

export function Dashboard({
  role,
  view = "",
}: {
  role: string;
  view?: string;
}) {
  const [tab, setTab] = useState(
    view === "orders"
      ? "orders"
      : role === "admin"
        ? "users"
        : role === "provider"
          ? "inventory"
          : "orders",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const path =
    role === "admin"
      ? `admin/${tab === "inventory" ? "gear" : tab === "orders" ? "rentals" : "users"}?search=${encodeURIComponent(search)}&page=${page}&limit=10`
      : role === "provider"
        ? tab === "inventory"
          ? "provider/gear/my"
          : "provider/orders"
        : tab === "payments"
          ? "payments"
          : "rentals";
  const { data, error, loading, reload } = useApiData(path);
  const list = getRows(data);
  async function action(path: string, method: string, body?: unknown) {
    setBusy(path);
    setNotice("");
    try {
      await api(path, method, body);
      setNotice("Updated successfully.");
      await reload();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <main className="shell section">
      <div className="section-heading">
        <div>
          <div className="eyebrow">
            YOUR ADVENTURE HQ · {role.toUpperCase()}
          </div>
          <h1 className="page-title">
            {role === "provider"
              ? "Make good gear go further."
              : role === "admin"
                ? "Keep the adventure running."
                : "Your next chapter awaits."}
          </h1>
        </div>
        {role === "provider" && (
          <Link className="btn" href="/dashboard/provider/gear/new">
            + List new gear
          </Link>
        )}
      </div>
      <DashboardOverview role={role} key={path + notice} />
      <div className="tabs">
        {(role === "admin"
          ? ["users", "inventory", "orders"]
          : role === "provider"
            ? ["inventory", "orders"]
            : ["orders", "payments"]
        ).map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {role === "admin" && tab === "users" && (
        <label className="search-users">
          Search users
          <input
            placeholder="Name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <DataState
        loading={loading}
        error={error}
        empty={!list.length}
        retry={reload}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  {tab === "users"
                    ? "User"
                    : tab === "inventory"
                      ? "Equipment"
                      : "Rental / payment"}
                </th>
                <th>Details</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((record) => (
                <tr key={record.id}>
                  <td>
                    <strong>
                      {record.title ||
                        record.name ||
                        record.gear?.title ||
                        record.rentalOrder?.gear?.title ||
                        `#${record.id.slice(0, 8)}`}
                    </strong>
                    <small>
                      {record.email ||
                        record.brand ||
                        record.customer?.name ||
                        formatDate(record.createdAt)}
                    </small>
                  </td>
                  <td>
                    {record.role ||
                      record.category?.name ||
                      (record.startDate
                        ? `${formatDate(record.startDate)} – ${formatDate(record.endDate)}`
                        : "Payment record")}
                  </td>
                  <td>
                    <Badge
                      status={
                        record.status ||
                        (record.isAvailable ? "AVAILABLE" : "UNAVAILABLE")
                      }
                    />
                  </td>
                  <td>
                    {formatMoney(
                      record.dailyPrice ?? record.totalAmount ?? record.amount,
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      {role === "admin" && tab === "users" && (
                        <button
                          disabled={!!busy}
                          onClick={() =>
                            action(`admin/users/${record.id}`, "PATCH", {
                              status:
                                record.status === "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {record.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      )}
                      {tab === "inventory" && (
                        <Link href={`/gear/${record.id}`}>View ↗</Link>
                      )}
                      {role === "provider" && tab === "inventory" && (
                        <>
                          <Link
                            href={`/dashboard/provider/gear/${record.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            disabled={!!busy}
                            onClick={() => {
                              if (confirm("Remove this gear listing?"))
                                action(`provider/gear/${record.id}`, "DELETE");
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {role === "provider" &&
                        tab === "orders" &&
                        ["PLACED", "PAID", "PICKED_UP"].includes(
                          record.status || "",
                        ) && (
                          <button
                            disabled={!!busy}
                            onClick={() =>
                              action(`provider/orders/${record.id}`, "PATCH", {
                                status:
                                  record.status === "PLACED"
                                    ? "CONFIRMED"
                                    : record.status === "PAID"
                                      ? "PICKED_UP"
                                      : "RETURNED",
                              })
                            }
                          >
                            {record.status === "PLACED"
                              ? "Confirm"
                              : record.status === "PAID"
                                ? "Mark picked up"
                                : "Mark returned"}
                          </button>
                        )}
                      {role === "customer" && tab === "orders" && (
                        <>
                          {record.status === "PLACED" && (
                            <button
                              disabled={!!busy}
                              onClick={() =>
                                action(`rentals/${record.id}/cancel`, "PATCH")
                              }
                            >
                              Cancel
                            </button>
                          )}
                          {record.status === "CONFIRMED" && (
                            <Link
                              href={`/dashboard/customer/orders/${record.id}/pay`}
                            >
                              Pay now ↗
                            </Link>
                          )}
                          {record.status === "RETURNED" && !record.review && (
                            <ReviewForm order={record} done={reload} />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
      {role === "admin" && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ← Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page >= (data?.meta?.totalPage || 1)}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, getRows } from "@/lib/api";
import { formatMoney, formatDate } from "@/lib/format";
import { useApiData } from "@/hooks/use-api-data";
import { Badge } from "@/components/shared/badge";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { ReviewForm } from "@/features/reviews/review-form";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { ProfileSettings } from "@/features/dashboard/profile-settings";
import type { GearRecord } from "@/lib/types";
import {
  FiCreditCard,
  FiPlusCircle,
  FiBox,
  FiCalendar,
} from "react-icons/fi";

export function Dashboard({
  role,
  view = "",
}: {
  role: string;
  view?: string;
}) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const defaultTab = view === "orders" ? "orders" : "overview";
  const tab = urlTab || defaultTab;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const path =
    tab === "profile"
      ? ""
      : role === "admin"
        ? tab === "overview"
          ? "admin/rentals?limit=8"
          : `admin/${
              tab === "inventory" ? "gear" : tab === "orders" ? "rentals" : "users"
            }?search=${encodeURIComponent(search)}&page=${page}&limit=10`
        : role === "provider"
          ? tab === "overview"
            ? "provider/orders"
            : tab === "inventory"
              ? "provider/gear/my"
              : "provider/orders"
          : tab === "overview"
            ? "rentals"
            : tab === "payments"
              ? "payments"
              : "rentals";

  const { data, error, loading, reload } = useApiData(path);
  const list = getRows(data);

  // Dedicated check for customer's rentals awaiting payment
  const customerRentals = useApiData(role === "customer" ? "rentals" : "");
  const pendingPayments =
    role === "customer"
      ? getRows(customerRentals.data).filter((o) =>
          ["PLACED", "CONFIRMED"].includes(o.status || "")
        )
      : [];

  async function action(actionPath: string, method: string, body?: unknown) {
    setBusy(actionPath);
    setNotice("");
    try {
      await api(actionPath, method, body);
      setNotice("Updated successfully.");
      await reload();
      if (role === "customer") customerRentals.reload();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  // Define Reusable DataTable Columns dynamically per tab
  const userColumns: ColumnDef<GearRecord>[] = [
    {
      key: "user",
      header: "Member Profile",
      cell: (row) => (
        <div className="dash-table-primary">
          <strong className="text-forest">{row.name || "User"}</strong>
          <small className="dash-table-sub">{row.email}</small>
        </div>
      ),
    },
    {
      key: "role",
      header: "Access Role",
      cell: (row) => (
        <span className={`dash-role-badge role-${row.role?.toLowerCase()}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Account Status",
      cell: (row) => <Badge status={row.status || "ACTIVE"} />,
    },
    {
      key: "productsGiven",
      header: "Products Listed",
      align: "center",
      cell: (row) => (
        <span className="dash-stat-chip">
          <FiBox size={12} /> {row._count?.gearItems ?? 0} Listed
        </span>
      ),
    },
    {
      key: "productsRented",
      header: "Rentals Booked",
      align: "center",
      cell: (row) => (
        <span className="dash-stat-chip">
          <FiCalendar size={12} /> {row._count?.rentalOrders ?? 0} Booked
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <button
          type="button"
          className={`dash-action-btn ${row.status === "ACTIVE" ? "danger" : ""}`}
          disabled={busy === `admin/users/${row.id}`}
          onClick={() =>
            action(`admin/users/${row.id}`, "PATCH", {
              status: row.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
            })
          }
        >
          {row.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
        </button>
      ),
    },
  ];

  const inventoryColumns: ColumnDef<GearRecord>[] = [
    {
      key: "title",
      header: "Equipment Item",
      cell: (row) => (
        <div className="dash-table-primary">
          <strong>{row.title}</strong>
          <small className="dash-table-sub">{row.brand}</small>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <span className="dash-table-meta">{row.category?.name || "General"}</span>
      ),
    },
    {
      key: "stock",
      header: "Availability & Stock",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Badge status={row.isAvailable ? "AVAILABLE" : "UNAVAILABLE"} />
          <small className="dash-table-sub">({row.availableStock} in stock)</small>
        </div>
      ),
    },
    {
      key: "price",
      header: "Daily Rate",
      cell: (row) => (
        <span className="dash-table-price">{formatMoney(row.dailyPrice)}/day</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="table-actions justify-end">
          <Link className="dash-action-link" href={`/gear/${row.id}`}>
            View ↗
          </Link>
          {role === "provider" && (
            <>
              <Link
                className="dash-action-link"
                href={`/dashboard/provider/gear/${row.id}/edit`}
              >
                Edit
              </Link>
              <button
                type="button"
                className="dash-action-btn danger"
                disabled={busy === `provider/gear/${row.id}`}
                onClick={() => {
                  if (confirm("Remove this gear listing permanently?"))
                    action(`provider/gear/${row.id}`, "DELETE");
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const orderColumns: ColumnDef<GearRecord>[] = [
    {
      key: "gear",
      header: "Rented Equipment",
      cell: (row) => (
        <div className="dash-table-primary">
          <strong>
            {row.gear?.title || row.rentalOrder?.gear?.title || `#${row.id.slice(0, 8)}`}
          </strong>
          <small className="dash-table-sub">
            {row.customer
              ? `Rented by ${row.customer.name}`
              : row.gear?.provider
                ? `Provider: ${row.gear.provider.name}`
                : formatDate(row.createdAt)}
          </small>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Rental Duration",
      cell: (row) => (
        <span className="dash-table-meta">
          {row.startDate ? `${formatDate(row.startDate)} – ${formatDate(row.endDate)}` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Order Lifecycle",
      cell: (row) => <Badge status={row.status} />,
    },
    {
      key: "amount",
      header: "Rental Price",
      cell: (row) => (
        <span className="dash-table-price">{formatMoney(row.totalAmount ?? row.amount)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="table-actions justify-end">
          {role === "customer" && (
            <>
              {["PLACED", "CONFIRMED"].includes(row.status || "") && (
                <Link
                  href={`/dashboard/customer/orders/${row.id}/pay`}
                  className="btn btn-pay-stripe small"
                >
                  Pay with Stripe 💳 ↗
                </Link>
              )}
              {row.status === "PLACED" && (
                <button
                  type="button"
                  className="dash-action-btn danger"
                  disabled={busy === `rentals/${row.id}/cancel`}
                  onClick={() => action(`rentals/${row.id}/cancel`, "PATCH")}
                >
                  Cancel Order
                </button>
              )}
              {row.status === "RETURNED" && !row.review && (
                <ReviewForm order={row} done={reload} />
              )}
            </>
          )}

          {role === "provider" && ["PLACED", "PAID", "PICKED_UP"].includes(row.status || "") && (
            <button
              type="button"
              className="btn small"
              disabled={busy === `provider/orders/${row.id}`}
              onClick={() =>
                action(`provider/orders/${row.id}`, "PATCH", {
                  status:
                    row.status === "PLACED"
                      ? "CONFIRMED"
                      : row.status === "PAID"
                        ? "PICKED_UP"
                        : "RETURNED",
                })
              }
            >
              {row.status === "PLACED"
                ? "Confirm Reservation"
                : row.status === "PAID"
                  ? "Mark Picked Up"
                  : "Mark Returned"}
            </button>
          )}

          {role === "admin" && (
            <span className="text-muted text-xs">Monitored</span>
          )}
        </div>
      ),
    },
  ];

  const paymentColumns: ColumnDef<GearRecord>[] = [
    {
      key: "transaction",
      header: "Transaction Reference",
      cell: (row) => (
        <div className="dash-table-primary">
          <strong>{row.rentalOrder?.gear?.title || "Equipment Rental"}</strong>
          <small className="dash-table-sub">
            ID: {row.transactionId || row.stripePaymentIntentId || `#${row.id.slice(0, 8)}`}
          </small>
        </div>
      ),
    },
    {
      key: "date",
      header: "Settled Date",
      cell: (row) => (
        <span className="dash-table-meta">
          {formatDate(row.paidAt || row.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      cell: (row) => <Badge status={row.status} />,
    },
    {
      key: "amount",
      header: "Amount Settled",
      cell: (row) => (
        <span className="dash-table-price">{formatMoney(row.amount)}</span>
      ),
    },
    {
      key: "method",
      header: "Method",
      align: "right",
      cell: (row) => (
        <span className="dash-stat-chip">
          <FiCreditCard size={12} /> {typeof row.provider === "string" ? row.provider : row.provider?.name || "STRIPE"}
        </span>
      ),
    },
  ];

  const currentColumns =
    tab === "users"
      ? userColumns
      : tab === "inventory"
        ? inventoryColumns
        : tab === "payments"
          ? paymentColumns
          : orderColumns;

  return (
    <div className="dash-content-wrapper">
      {/* Top Header Section */}
      <div className="dash-header-section">
        <div>
          <div className="dash-eyebrow">
            {tab === "profile" ? "ACCOUNT MANAGEMENT" : `WORKSPACE · ${role.toUpperCase()}`}
          </div>
          <h1 className="dash-page-title">
            {tab === "profile"
              ? "Personal Profile & Contact"
              : tab === "overview"
                ? role === "provider"
                  ? "Provider Command Center"
                  : role === "admin"
                    ? "Platform Control & Moderation"
                    : "Your Outdoor Equipment Hub"
                : tab === "inventory"
                  ? "Gear Inventory & Listings"
                  : tab === "orders"
                    ? role === "customer" ? "My Rental Adventures" : "Incoming Rental Bookings"
                    : tab === "payments"
                      ? "Payment History & Receipts"
                      : "Platform Members Directory"}
          </h1>
          <p className="dash-subtitle">
            {tab === "profile"
              ? "Keep your account information, contact phone, and equipment delivery coordinates up to date."
              : tab === "overview"
                ? role === "provider"
                  ? "Manage listings, confirm bookings, and track equipment earnings."
                  : role === "admin"
                    ? "Global platform indicators, activity velocity, and member health."
                    : "Track ongoing rentals, complete pending payments, and review gear."
                : tab === "inventory"
                  ? "Manage equipment listings, availability statuses, and daily rates."
                  : tab === "orders"
                    ? role === "customer"
                      ? "Review confirmed gear, complete checkout, and request equipment returns."
                      : "Review placed bookings, confirm reservations, and hand off gear."
                    : tab === "payments"
                      ? "Audit all settled Stripe transactions and payment receipts."
                      : "Search and inspect registered customer and provider accounts."}
          </p>
        </div>

        {role === "provider" && tab !== "profile" && (
          <Link className="btn dash-header-cta" href="/dashboard/provider/gear/new">
            <FiPlusCircle size={16} />
            <span>List new gear</span>
          </Link>
        )}
      </div>

      {/* Render Profile Tab View if active */}
      {tab === "profile" ? (
        <ProfileSettings role={role} />
      ) : (
        <>
          {/* Executive Overview: 4 Stat Metric Cards & Activity Chart (on Overview) */}
          {tab === "overview" && (
            <DashboardOverview
              role={role}
              showGraph={true}
              initialOrders={list}
              loadingOrders={loading}
            />
          )}

          {/* Customer Action Center: Pending Payments Alert */}
          {role === "customer" && pendingPayments.length > 0 && (
            <section className="dash-payment-alert-box" aria-label="Pending payments">
              <div className="dash-payment-alert-header">
                <div className="dash-alert-pill">
                  <FiCreditCard size={13} />
                  <span>ACTION REQUIRED</span>
                </div>
                <h2>You have {pendingPayments.length} rental(s) awaiting payment</h2>
                <p>
                  Complete checkout via Stripe to secure your gear reservation.
                </p>
              </div>
              <div className="dash-payment-card-list">
                {pendingPayments.map((order) => (
                  <div key={order.id} className="dash-payment-card-row">
                    <div className="dash-payment-gear-info">
                      <strong>{order.gear?.title || "Rental Order"}</strong>
                      <span className="dash-payment-dates">
                        {formatDate(order.startDate)} – {formatDate(order.endDate)} ({order.totalDays || 1} days)
                      </span>
                    </div>
                    <div className="dash-payment-action-group">
                      <div className="dash-payment-amount">
                        <small>Total Due</small>
                        <strong>{formatMoney(order.totalAmount)}</strong>
                      </div>
                      <Link
                        href={`/dashboard/customer/orders/${order.id}/pay`}
                        className="btn btn-pay-stripe"
                      >
                        <FiCreditCard size={14} />
                        <span>Pay with Stripe</span>
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {notice && (
            <div className="dash-inline-notice" role="status">
              <span>{notice}</span>
            </div>
          )}

          {/* Overview Table Header */}
          {tab === "overview" && (
            <div className="dash-overview-table-header">
              <div>
                <h2 className="dash-overview-table-title">
                  {role === "customer"
                    ? "Recent Rentals"
                    : role === "provider"
                      ? "Recent Incoming Bookings"
                      : "Recent Platform Bookings"}
                </h2>
                <p className="dash-overview-table-subtitle">
                  {role === "customer"
                    ? "Your latest equipment reservations and status."
                    : role === "provider"
                      ? "Latest orders placed by customers awaiting action."
                      : "Platform-wide equipment transactions."}
                </p>
              </div>
              <Link
                href={
                  role === "customer"
                    ? "/dashboard/customer?tab=orders"
                    : role === "provider"
                      ? "/dashboard/provider/orders"
                      : "/dashboard/admin?tab=orders"
                }
                className="dash-overview-view-all"
              >
                <span>
                  {role === "customer"
                    ? "View all rentals"
                    : role === "provider"
                      ? "View all incoming orders"
                      : "View all platform bookings"}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          {/* Reusable DataTable Component with Pagination & Search */}
          <DataTable
            columns={currentColumns}
            data={tab === "overview" ? list.slice(0, 5) : list}
            loading={loading}
            error={error}
            retry={reload}
            emptyMessage={
              tab === "users"
                ? "No platform members match your search criteria."
                : tab === "payments"
                  ? "No payment transactions settled yet."
                  : tab === "inventory"
                    ? "No equipment in inventory. Click 'List new gear' to add equipment."
                    : role === "customer"
                      ? "You have no rental bookings yet. Explore our gear collection to start an adventure!"
                      : "No incoming rental orders at this time."
            }
            search={
              role === "admin" && tab === "users"
                ? {
                    value: search,
                    placeholder: "Search users by name or email…",
                    onChange: (val) => {
                      setSearch(val);
                      setPage(1);
                    },
                  }
                : undefined
            }
            pagination={
              role === "admin"
                ? {
                    page,
                    totalPages: data?.meta?.totalPage || 1,
                    onPageChange: (p) => setPage(p),
                  }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}

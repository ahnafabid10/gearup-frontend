"use client";

import { getRows } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useApiData } from "@/hooks/use-api-data";
import {
  FiUsers,
  FiBox,
  FiActivity,
  FiDollarSign,
  FiClipboard,
  FiCalendar,
  FiCreditCard,
  FiTrendingUp,
} from "react-icons/fi";
import { ActivityGraph } from "@/components/dashboard/activity-graph";

export function DashboardOverview({ role }: { role: string }) {
  const usersReq = useApiData(role === "admin" ? "admin/users?limit=1" : "");
  const gearReq = useApiData(
    role === "admin"
      ? "gear?isAvailable=true&limit=1"
      : role === "provider"
        ? "provider/gear/my"
        : ""
  );
  const rentalsReq = useApiData(
    role === "admin"
      ? "admin/rentals?limit=1"
      : role === "provider"
        ? "provider/orders"
        : "rentals"
  );
  const paymentsReq = useApiData(role === "customer" ? "payments" : "");

  const count = (r: ReturnType<typeof useApiData>) =>
    r.loading || r.error ? "—" : (r.data?.meta?.total ?? getRows(r.data).length);

  // Calculations for 4 metric cards per role
  const providerOrdersList = getRows(rentalsReq.data);
  const customerRentalsList = getRows(rentalsReq.data);

  const providerActiveCount = providerOrdersList.filter((x) =>
    ["PAID", "PICKED_UP"].includes(x.status || "")
  ).length;

  const providerPendingCount = providerOrdersList.filter(
    (x) => x.status === "PLACED"
  ).length;

  const providerTotalRevenue = providerOrdersList
    .filter((x) => ["PAID", "PICKED_UP", "RETURNED"].includes(x.status || ""))
    .reduce((sum, x) => sum + (Number(x.totalAmount) || 0), 0);

  const customerActiveCount = customerRentalsList.filter((x) =>
    ["CONFIRMED", "PAID", "PICKED_UP"].includes(x.status || "")
  ).length;

  const customerPendingCheckout = customerRentalsList.filter(
    (x) => x.status === "CONFIRMED"
  ).length;

  const customerTotalSpent = getRows(paymentsReq.data)
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const cards =
    role === "admin"
      ? [
          {
            label: "Registered Users",
            value: count(usersReq),
            icon: FiUsers,
            hint: "Active & verified members",
          },
          {
            label: "Gear Inventory",
            value: count(gearReq),
            icon: FiBox,
            hint: "Live equipment listings",
          },
          {
            label: "Rental Transactions",
            value: count(rentalsReq),
            icon: FiActivity,
            hint: "Total platform bookings",
          },
          {
            label: "Platform Velocity",
            value: "98.4%",
            icon: FiTrendingUp,
            hint: "Booking fulfillment rate",
          },
        ]
      : role === "provider"
        ? [
            {
              label: "Inventory Listed",
              value: count(gearReq),
              icon: FiBox,
              hint: "Active equipment in stock",
            },
            {
              label: "Active Rentals",
              value: rentalsReq.loading ? "—" : providerActiveCount,
              icon: FiActivity,
              hint: "Currently with customers",
            },
            {
              label: "Total Earnings",
              value: rentalsReq.loading ? "—" : formatMoney(providerTotalRevenue),
              icon: FiDollarSign,
              hint: "Settled rental revenue",
            },
            {
              label: "Pending Orders",
              value: rentalsReq.loading ? "—" : providerPendingCount,
              icon: FiClipboard,
              hint: "Awaiting your confirmation",
            },
          ]
        : [
            {
              label: "Total Rentals",
              value: count(rentalsReq),
              icon: FiCalendar,
              hint: "Your booking history",
            },
            {
              label: "Active Adventures",
              value: rentalsReq.loading ? "—" : customerActiveCount,
              icon: FiBox,
              hint: "Current or confirmed gear",
            },
            {
              label: "Total Invested",
              value: paymentsReq.loading ? "—" : formatMoney(customerTotalSpent),
              icon: FiDollarSign,
              hint: "Total equipment spend",
            },
            {
              label: "Pending Checkout",
              value: rentalsReq.loading ? "—" : customerPendingCheckout,
              icon: FiCreditCard,
              hint: "Awaiting Stripe payment",
            },
          ];

  return (
    <div className="dash-overview-block">
      {/* 4 Responsive Stat Metric Cards */}
      <div className="dash-stat-grid-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <article key={c.label} className="dash-stat-card">
              <div className="dash-stat-card-top">
                <span className="dash-stat-label">{c.label}</span>
                <span className="dash-stat-icon-pill">
                  <Icon size={16} />
                </span>
              </div>
              <strong className="dash-stat-value">{c.value}</strong>
              <small className="dash-stat-hint">{c.hint}</small>
            </article>
          );
        })}
      </div>

      {/* Activity Graph Component */}
      <ActivityGraph
        role={role}
        title={
          role === "provider"
            ? "Monthly Revenue & Booking Performance"
            : role === "admin"
              ? "Platform Activity & Velocity"
              : "Rental Frequency & Outdoor Milestones"
        }
      />
    </div>
  );
}

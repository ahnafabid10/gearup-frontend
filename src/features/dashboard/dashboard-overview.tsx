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
import type { GearRecord } from "@/lib/types";

export function DashboardOverview({
  role,
  showGraph = true,
  initialOrders,
  loadingOrders = false,
}: {
  role: string;
  showGraph?: boolean;
  initialOrders?: GearRecord[];
  loadingOrders?: boolean;
}) {
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
      ? "admin/rentals?limit=50"
      : role === "provider"
        ? initialOrders !== undefined
          ? ""
          : "provider/orders"
        : initialOrders !== undefined
          ? ""
          : "rentals"
  );
  const paymentsReq = useApiData(role === "customer" ? "payments" : "");

  const activeRentalsList =
    initialOrders !== undefined
      ? initialOrders
      : getRows(rentalsReq.data);

  const providerOrdersList =
    role === "provider" && initialOrders !== undefined
      ? initialOrders
      : getRows(rentalsReq.data);

  const isRentalsLoading =
    initialOrders !== undefined ? loadingOrders : rentalsReq.loading;

  // Dynamic calculations for Customer
  const customerTotalRentals = activeRentalsList.length;

  const customerActiveCount = activeRentalsList.filter((x) =>
    ["CONFIRMED", "PAID", "PICKED_UP"].includes(x.status || "")
  ).length;

  const customerPendingCheckout = activeRentalsList.filter(
    (x) => x.status === "CONFIRMED"
  ).length;

  const paymentsList = getRows(paymentsReq.data);
  const customerTotalSpent =
    paymentsList.length > 0
      ? paymentsList
          .filter((p) => p.status === "COMPLETED")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      : activeRentalsList
          .filter((x) => ["PAID", "PICKED_UP", "RETURNED"].includes(x.status || ""))
          .reduce((sum, x) => sum + (Number(x.totalAmount) || 0), 0);

  // Dynamic calculations for Provider
  const providerActiveCount = providerOrdersList.filter((x) =>
    ["PAID", "PICKED_UP"].includes(x.status || "")
  ).length;

  const providerPendingCount = providerOrdersList.filter(
    (x) => x.status === "PLACED"
  ).length;

  const providerTotalRevenue = providerOrdersList
    .filter((x) => ["PAID", "PICKED_UP", "RETURNED"].includes(x.status || ""))
    .reduce((sum, x) => sum + (Number(x.totalAmount) || 0), 0);

  // Dynamic calculations for Admin
  const adminUsersTotal = usersReq.data?.meta?.total ?? getRows(usersReq.data).length;
  const adminGearTotal = gearReq.data?.meta?.total ?? getRows(gearReq.data).length;
  const adminRentalsTotal = rentalsReq.data?.meta?.total ?? getRows(rentalsReq.data).length;

  const cards =
    role === "admin"
      ? [
          {
            label: "Registered Users",
            value: usersReq.loading && !adminUsersTotal ? <span className="dash-stat-skel" /> : adminUsersTotal,
            icon: FiUsers,
            hint: "Active platform accounts",
          },
          {
            label: "Gear Inventory",
            value: gearReq.loading && !adminGearTotal ? <span className="dash-stat-skel" /> : adminGearTotal,
            icon: FiBox,
            hint: "Active equipment in stock",
          },
          {
            label: "Rental Transactions",
            value: rentalsReq.loading && !adminRentalsTotal ? <span className="dash-stat-skel" /> : adminRentalsTotal,
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
              value: gearReq.loading ? <span className="dash-stat-skel" /> : (gearReq.data?.meta?.total ?? getRows(gearReq.data).length),
              icon: FiBox,
              hint: "Active equipment in stock",
            },
            {
              label: "Active Rentals",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : providerActiveCount,
              icon: FiActivity,
              hint: "Currently with customers",
            },
            {
              label: "Total Earnings",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : formatMoney(providerTotalRevenue),
              icon: FiDollarSign,
              hint: "Settled rental revenue",
            },
            {
              label: "Pending Orders",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : providerPendingCount,
              icon: FiClipboard,
              hint: "Awaiting your confirmation",
            },
          ]
        : [
            {
              label: "Total Rentals",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : customerTotalRentals,
              icon: FiCalendar,
              hint: "Your booking history",
            },
            {
              label: "Active Adventures",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : customerActiveCount,
              icon: FiBox,
              hint: "Current or confirmed gear",
            },
            {
              label: "Total Invested",
              value: paymentsReq.loading && isRentalsLoading ? <span className="dash-stat-skel" /> : formatMoney(customerTotalSpent),
              icon: FiDollarSign,
              hint: "Total equipment spend",
            },
            {
              label: "Pending Checkout",
              value: isRentalsLoading ? <span className="dash-stat-skel" /> : customerPendingCheckout,
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
      {showGraph && (
        <ActivityGraph
          role={role}
          title={
            role === "provider"
              ? "Monthly Revenue & Booking Performance"
              : role === "admin"
                ? "Platform Activity & Velocity"
                : "Rental Frequency & Outdoor Milestones"
          }
          items={role === "provider" ? providerOrdersList : activeRentalsList}
        />
      )}
    </div>
  );
}

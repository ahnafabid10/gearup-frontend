"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import {
  FiGrid,
  FiBox,
  FiCreditCard,
  FiPlusCircle,
  FiClipboard,
  FiTag,
  FiUsers,
  FiShield,
  FiActivity,
  FiUser,
  FiLogOut,
  FiExternalLink,
  FiMenu,
  FiX,
} from "react-icons/fi";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN" | string;
};

export function DashboardSidebar({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user.role?.toLowerCase() || "customer";

  // Data for live notification badges
  const customerRentals = useApiData(role === "customer" ? "rentals" : "");
  const providerOrders = useApiData(role === "provider" ? "provider/orders" : "");

  const pendingPaymentsCount =
    role === "customer"
      ? getRows(customerRentals.data).filter((o) =>
          ["PLACED", "CONFIRMED"].includes(o.status || "")
        ).length
      : 0;

  const pendingOrdersCount =
    role === "provider"
      ? getRows(providerOrders.data).filter((o) => o.status === "PLACED").length
      : 0;

  const handleSignOut = async () => {
    try {
      await api("auth/logout", "POST");
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  const navItemClass = (active: boolean) =>
    `dash-nav-item ${active ? "active" : ""}`;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="dash-mobile-bar">
        <button
          type="button"
          className="dash-mobile-toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
        <span className="dash-mobile-title">
          gearup<span className="accent-mark">↗</span> · {role.toUpperCase()}
        </span>
        <Link href="/gear" className="dash-mobile-storefront" title="Storefront">
          <FiExternalLink size={16} />
        </Link>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="dash-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`dash-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand & Space Header */}
        <div className="dash-sidebar-header">
          <Link href="/" className="dash-brand">
            gearup<span>↗</span>
          </Link>
          <span className={`dash-role-badge role-${role}`}>
            {role.toUpperCase()}
          </span>
        </div>

        {/* User Identity Snapshot */}
        <div className="dash-user-card">
          <div className="dash-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="dash-user-info">
            <strong className="dash-user-name">{user.name || "Explorer"}</strong>
            <small className="dash-user-email">{user.email}</small>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="dash-nav" onClick={() => setMobileOpen(false)}>
          <span className="dash-nav-label">WORKSPACE</span>

          {role === "customer" && (
            <>
              <Link
                href="/dashboard/customer"
                className={navItemClass(
                  pathname === "/dashboard/customer" && !currentTab
                )}
              >
                <span className="dash-nav-icon">
                  <FiGrid size={16} />
                </span>
                <span>Overview</span>
              </Link>

              <Link
                href="/dashboard/customer?tab=orders"
                className={navItemClass(
                  pathname === "/dashboard/customer" && currentTab === "orders"
                )}
              >
                <span className="dash-nav-icon">
                  <FiBox size={16} />
                </span>
                <span>My Rentals</span>
              </Link>

              <Link
                href="/dashboard/customer?tab=payments"
                className={navItemClass(
                  pathname.includes("/orders/") && pathname.endsWith("/pay")
                    ? true
                    : pathname === "/dashboard/customer" &&
                      currentTab === "payments"
                )}
              >
                <span className="dash-nav-icon">
                  <FiCreditCard size={16} />
                </span>
                <span className="flex-1">Pending Payments</span>
                {pendingPaymentsCount > 0 && (
                  <span className="dash-alert-badge" title="Awaiting Stripe checkout">
                    {pendingPaymentsCount} Due
                  </span>
                )}
              </Link>
            </>
          )}

          {role === "provider" && (
            <>
              <Link
                href="/dashboard/provider"
                className={navItemClass(
                  pathname === "/dashboard/provider" && !currentTab
                )}
              >
                <span className="dash-nav-icon">
                  <FiGrid size={16} />
                </span>
                <span>Overview</span>
              </Link>

              <Link
                href="/dashboard/provider?tab=inventory"
                className={navItemClass(
                  pathname === "/dashboard/provider" && currentTab === "inventory"
                )}
              >
                <span className="dash-nav-icon">
                  <FiBox size={16} />
                </span>
                <span>Gear Inventory</span>
              </Link>

              <Link
                href="/dashboard/provider/gear/new"
                className={navItemClass(
                  pathname === "/dashboard/provider/gear/new"
                )}
              >
                <span className="dash-nav-icon">
                  <FiPlusCircle size={16} />
                </span>
                <span>+ List New Gear</span>
              </Link>

              <Link
                href="/dashboard/provider/orders"
                className={navItemClass(
                  pathname === "/dashboard/provider/orders" ||
                    (pathname === "/dashboard/provider" && currentTab === "orders")
                )}
              >
                <span className="dash-nav-icon">
                  <FiClipboard size={16} />
                </span>
                <span className="flex-1">Incoming Orders</span>
                {pendingOrdersCount > 0 && (
                  <span className="dash-alert-badge">
                    {pendingOrdersCount} New
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/provider/categories"
                className={navItemClass(
                  pathname === "/dashboard/provider/categories"
                )}
              >
                <span className="dash-nav-icon">
                  <FiTag size={16} />
                </span>
                <span>Categories</span>
              </Link>
            </>
          )}

          {role === "admin" && (
            <>
              <Link
                href="/dashboard/admin"
                className={navItemClass(
                  pathname === "/dashboard/admin" && !currentTab
                )}
              >
                <span className="dash-nav-icon">
                  <FiActivity size={16} />
                </span>
                <span>Platform Health</span>
              </Link>

              <Link
                href="/dashboard/admin?tab=users"
                className={navItemClass(
                  pathname === "/dashboard/admin" && currentTab === "users"
                )}
              >
                <span className="dash-nav-icon">
                  <FiUsers size={16} />
                </span>
                <span>Users & Roles</span>
              </Link>

              <Link
                href="/dashboard/admin?tab=inventory"
                className={navItemClass(
                  pathname === "/dashboard/admin" && currentTab === "inventory"
                )}
              >
                <span className="dash-nav-icon">
                  <FiBox size={16} />
                </span>
                <span>Gear Moderation</span>
              </Link>

              <Link
                href="/dashboard/admin?tab=orders"
                className={navItemClass(
                  pathname === "/dashboard/admin" && currentTab === "orders"
                )}
              >
                <span className="dash-nav-icon">
                  <FiShield size={16} />
                </span>
                <span>Rental Orders</span>
              </Link>

              <Link
                href="/dashboard/admin/categories"
                className={navItemClass(
                  pathname === "/dashboard/admin/categories"
                )}
              >
                <span className="dash-nav-icon">
                  <FiTag size={16} />
                </span>
                <span>Category Master</span>
              </Link>
            </>
          )}

          <div className="dash-nav-divider" />
          <span className="dash-nav-label">SETTINGS & ACCESS</span>

          {/* User Profile Navigation Link */}
          <Link
            href={`/dashboard/${role}?tab=profile`}
            className={navItemClass(currentTab === "profile")}
          >
            <span className="dash-nav-icon">
              <FiUser size={16} />
            </span>
            <span>Profile Settings</span>
          </Link>

          <Link href="/gear" className="dash-nav-item">
            <span className="dash-nav-icon">
              <FiExternalLink size={16} />
            </span>
            <span>Browse Catalog</span>
          </Link>
        </nav>

        {/* Sidebar Footer with Sign Out */}
        <div className="dash-sidebar-footer">
          <button
            type="button"
            className="dash-signout-btn"
            onClick={handleSignOut}
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

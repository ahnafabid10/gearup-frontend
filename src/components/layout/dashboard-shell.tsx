"use client";

import { Suspense, type ReactNode } from "react";
import { DashboardSidebar, type DashboardUser } from "./dashboard-sidebar";

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: ReactNode;
}) {
  return (
    <div className="dash-shell-container">
      <Suspense fallback={<aside className="dash-sidebar" aria-hidden="true" />}>
        <DashboardSidebar user={user} />
      </Suspense>
      <div className="dash-main-viewport">
        <header className="dash-top-header">
          <div className="dash-top-crumbs">
            <span className="dash-crumb-root">Dashboard</span>
            <span className="dash-crumb-sep">/</span>
            <span className="dash-crumb-current">
              {user.role?.toLowerCase() || "workspace"}
            </span>
          </div>
          <div className="dash-top-status">
            <span className="dash-status-indicator" />
            <span className="dash-status-text">Live System</span>
          </div>
        </header>
        <div className="dash-page-body">{children}</div>
      </div>
    </div>
  );
}

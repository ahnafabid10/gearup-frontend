import { Suspense } from "react";
import { Dashboard } from "@/features/dashboard/dashboard";

export default async function Page({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return (
    <Suspense
      fallback={
        <div style={{ padding: "32px" }}>
          <div
            className="dash-skeleton-row"
            style={{ height: "40px", marginBottom: "20px" }}
          />
          <div className="dash-stat-grid-4">
            <div className="dash-stat-card" style={{ height: "110px" }} />
            <div className="dash-stat-card" style={{ height: "110px" }} />
            <div className="dash-stat-card" style={{ height: "110px" }} />
            <div className="dash-stat-card" style={{ height: "110px" }} />
          </div>
        </div>
      }
    >
      <Dashboard role={role} view="orders" />
    </Suspense>
  );
}

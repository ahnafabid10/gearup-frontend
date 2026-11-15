"use client";

import { useState } from "react";
import { FiTrendingUp, FiActivity, FiCalendar } from "react-icons/fi";
import { formatMoney } from "@/lib/format";
import type { GearRecord } from "@/lib/types";

type ActivityDataPoint = {
  label: string;
  rentals: number;
  revenue: number;
};

// Computes dynamic, real-time monthly volume and counts from actual database orders
function computeMonthlyTrends(orders: GearRecord[]): ActivityDataPoint[] {
  const months: { label: string; monthIndex: number; year: number; rentals: number; revenue: number }[] = [];
  const now = new Date();

  // Generate the last 6 calendar months dynamically in chronological order
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short" });
    months.push({
      label,
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      rentals: 0,
      revenue: 0,
    });
  }

  // Populate from real orders
  for (const o of orders) {
    const dateStr = o.createdAt || o.startDate;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) continue;

    const mIdx = d.getMonth();
    const yr = d.getFullYear();

    const target = months.find((m) => m.monthIndex === mIdx && m.year === yr);
    if (target) {
      target.rentals += 1;
      const amount = Number(o.totalAmount ?? o.amount ?? 0);
      target.revenue += amount;
    }
  }

  return months.map(({ label, rentals, revenue }) => ({
    label,
    rentals,
    revenue,
  }));
}

export function ActivityGraph({
  role,
  title = "Platform Activity & Rental Velocity",
  items = [],
  loading = false,
}: {
  role: string;
  title?: string;
  items?: GearRecord[];
  loading?: boolean;
}) {
  const [metric, setMetric] = useState<"rentals" | "revenue">("rentals");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = computeMonthlyTrends(items);
  const rawMax = Math.max(...data.map((d) => d[metric]));
  const maxValue = rawMax > 0 ? rawMax * 1.3 : metric === "revenue" ? 1000 : 5;

  const totalSum = data.reduce((acc, d) => acc + d[metric], 0);

  const chartHeight = 180;
  const chartWidth = 540;
  const colWidth = chartWidth / data.length;

  return (
    <div className="dash-chart-card">
      <div className="dash-chart-header">
        <div>
          <div className="dash-chart-eyebrow">
            <FiActivity className="text-forest" size={13} />
            <span>ACTIVITY TRENDS (DYNAMIC REAL-TIME)</span>
          </div>
          <h3 className="dash-chart-title">{title}</h3>
          <p className="dash-chart-desc">
            {role === "customer"
              ? "Your dynamic booking volume and equipment adventure duration across recent months."
              : role === "provider"
                ? "Monthly rental fulfillment and equipment earnings from customer bookings."
                : "Platform-wide transaction velocity and seasonal equipment volume."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {loading ? (
            <span className="dash-stat-skel" style={{ width: "90px", height: "20px" }} />
          ) : (
            <span className="dash-stat-chip" style={{ fontSize: "12px", fontWeight: "600" }}>
              {metric === "revenue" ? formatMoney(totalSum) : `${totalSum} Total Bookings`}
            </span>
          )}

          <div className="dash-chart-controls">
            <button
              type="button"
              className={`dash-chart-btn ${metric === "rentals" ? "active" : ""}`}
              onClick={() => setMetric("rentals")}
            >
              <FiCalendar size={13} />
              <span>Rentals</span>
            </button>
            <button
              type="button"
              className={`dash-chart-btn ${metric === "revenue" ? "active" : ""}`}
              onClick={() => setMetric("revenue")}
            >
              <FiTrendingUp size={13} />
              <span>Volume ($)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dash-chart-body">
        {/* SVG Area & Bar Chart */}
        <div className="dash-svg-wrap">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="dash-svg-chart"
            preserveAspectRatio="none"
          >
            {/* Horizontal guideline grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <line
                key={i}
                x1="0"
                y1={chartHeight * (1 - pct)}
                x2={chartWidth}
                y2={chartHeight * (1 - pct)}
                stroke="#edf1ec"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Dynamic Bars and Data Area */}
            {data.map((d, i) => {
              const val = d[metric];
              const barHeight = val > 0 ? Math.max(8, (val / maxValue) * (chartHeight - 30)) : 3;
              const x = i * colWidth + colWidth * 0.25;
              const y = chartHeight - barHeight;
              const w = colWidth * 0.5;
              const isHovered = hoveredIdx === i;

              return (
                <g
                  key={d.label}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="dash-bar-group"
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={barHeight}
                    rx="4"
                    fill={val > 0 ? (isHovered ? "#234127" : "#2e5233") : "#d8dfd5"}
                    className="dash-chart-bar"
                  />
                  {val > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height="3"
                      rx="1.5"
                      fill="#759c7b"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="dash-chart-x-axis">
          {data.map((d, i) => (
            <div
              key={d.label}
              className={`dash-x-label ${hoveredIdx === i ? "active" : ""}`}
            >
              <span>{d.label}</span>
              {hoveredIdx === i && (
                <div className="dash-chart-tooltip">
                  <strong>
                    {metric === "revenue"
                      ? formatMoney(d.revenue)
                      : `${d.rentals} Rental${d.rentals === 1 ? "" : "s"}`}
                  </strong>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

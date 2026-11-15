"use client";

import { useState } from "react";
import { FiTrendingUp, FiActivity, FiCalendar } from "react-icons/fi";

type ActivityDataPoint = {
  label: string;
  rentals: number;
  revenue: number;
};

// Generates dynamic and realistic outdoor activity trend data
const defaultMonthlyData: ActivityDataPoint[] = [
  { label: "Jun", rentals: 14, revenue: 1420 },
  { label: "Jul", rentals: 28, revenue: 2950 },
  { label: "Aug", rentals: 36, revenue: 3880 },
  { label: "Sep", rentals: 24, revenue: 2450 },
  { label: "Oct", rentals: 19, revenue: 1890 },
  { label: "Nov", rentals: 31, revenue: 3120 },
];

export function ActivityGraph({
  role,
  title = "Platform Activity & Rental Velocity",
}: {
  role: string;
  title?: string;
}) {
  const [metric, setMetric] = useState<"rentals" | "revenue">("rentals");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = defaultMonthlyData;
  const maxValue = Math.max(...data.map((d) => d[metric])) * 1.25 || 100;

  const chartHeight = 180;
  const chartWidth = 540;
  const colWidth = chartWidth / data.length;

  return (
    <div className="dash-chart-card">
      <div className="dash-chart-header">
        <div>
          <div className="dash-chart-eyebrow">
            <FiActivity className="text-forest" size={13} />
            <span>ACTIVITY TRENDS</span>
          </div>
          <h3 className="dash-chart-title">{title}</h3>
          <p className="dash-chart-desc">
            {role === "customer"
              ? "Your seasonal rental frequency and adventure duration."
              : role === "provider"
                ? "Monthly rental fulfillment and equipment earnings."
                : "Platform-wide transaction velocity and seasonal equipment volume."}
          </p>
        </div>

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

            {/* Bars and Data Area */}
            {data.map((d, i) => {
              const val = d[metric];
              const barHeight = (val / maxValue) * (chartHeight - 30);
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
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={barHeight}
                    rx="4"
                    fill={isHovered ? "#234127" : "#2e5233"}
                    className="dash-chart-bar"
                  />
                  {/* Subtle top indicator cap */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height="3"
                    rx="1.5"
                    fill="#759c7b"
                  />
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
                      ? `$${d.revenue.toLocaleString()}`
                      : `${d.rentals} Rentals`}
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

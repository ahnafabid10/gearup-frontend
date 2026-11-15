"use client";

import { getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";

export function DashboardOverview({ role }: { role: string }) {
  const first = useApiData(
    role === "admin"
      ? "admin/users?limit=1"
      : role === "provider"
        ? "provider/gear/my"
        : "rentals",
  );
  const second = useApiData(
    role === "admin"
      ? "gear?isAvailable=true&limit=1"
      : role === "provider"
        ? "provider/orders"
        : "payments",
  );
  const third = useApiData(
    role === "admin"
      ? "admin/rentals?limit=1"
      : role === "provider"
        ? "provider/orders"
        : "rentals",
  );
  const count = (r: ReturnType<typeof useApiData>) =>
    r.loading || r.error
      ? "—"
      : (r.data?.meta?.total ?? getRows(r.data).length);
  const metrics =
    role === "admin"
      ? [
          ["Total users", count(first)],
          ["Available gear", count(second)],
          ["Total rentals", count(third)],
        ]
      : role === "provider"
        ? [
            ["Total gear listed", count(first)],
            [
              "Active rentals",
              second.loading || second.error
                ? "—"
                : getRows(second.data).filter((x) =>
                    ["PAID", "PICKED_UP"].includes(x.status || ""),
                  ).length,
            ],
            [
              "Pending orders",
              third.loading || third.error
                ? "—"
                : getRows(third.data).filter((x) => x.status === "PLACED")
                    .length,
            ],
          ]
        : [
            ["Your rentals", count(first)],
            ["Payments", count(second)],
            [
              "Active adventures",
              third.loading || third.error
                ? "—"
                : getRows(third.data).filter((x) =>
                    ["CONFIRMED", "PAID", "PICKED_UP"].includes(x.status || ""),
                  ).length,
            ],
          ];
  return (
    <div className="grid stats">
      {metrics.map(([label, value]) => (
        <article key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
          <span>Your live overview</span>
        </article>
      ))}
    </div>
  );
}

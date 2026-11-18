"use client";

import { formatMoney, formatDate } from "@/lib/format";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { Badge } from "@/components/shared/badge";

import type { GearRecord } from "@/lib/types";
import Link from "next/link";
import SecureCheckout from "@/features/payment/secure-checkout";

export function RentalPayment({ id }: { id: string }) {
  const order = useApiData(`rentals/${id}`);
  const item = order.data?.data as GearRecord | undefined;

  const canPay = item && ["PLACED", "CONFIRMED"].includes(item.status || "");
  const isPaid = item && ["PAID", "PICKED_UP", "RETURNED"].includes(item.status || "");
  const isCancelled = item && item.status === "CANCELLED";

  return (
    <main className="shell section narrow">
      <h1 className="page-title">One step closer to outside.</h1>
      <DataState
        loading={order.loading}
        error={order.error}
        empty={!item}
        retry={order.reload}
      >
        <div className="panel">
          <h2>{item?.gear?.title}</h2>
          <p>
            {formatDate(item?.startDate)} – {formatDate(item?.endDate)} ({item?.totalDays || 1} day{item?.totalDays === 1 ? "" : "s"})
          </p>
          <p className="big-price">{formatMoney(item?.totalAmount)}</p>
          <div style={{ marginBottom: "16px" }}>
            <Badge status={item?.status} />
          </div>

          {canPay && (
            <>
              <p style={{ color: "#5a6458", fontSize: "14px", margin: "10px 0" }}>
                Complete checkout via Stripe to secure your gear reservation.
              </p>
              <SecureCheckout orderId={id} />
            </>
          )}

          {isPaid && (
            <div style={{ padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", margin: "16px 0", color: "#166534" }}>
              <strong>✓ This rental order is fully paid.</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Check your rentals dashboard for pickup coordinates and updates.</p>
            </div>
          )}

          {isCancelled && (
            <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", margin: "16px 0", color: "#991b1b" }}>
              <strong>This rental order has been cancelled.</strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Payments cannot be accepted for cancelled reservations.</p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <Link className="btn small" href="/dashboard/customer">
              ← Back to my rentals
            </Link>
          </div>
        </div>
      </DataState>
    </main>
  );
}

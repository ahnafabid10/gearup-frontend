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
            {formatDate(item?.startDate)} – {formatDate(item?.endDate)}
          </p>
          <p className="big-price">{formatMoney(item?.totalAmount)}</p>
          <Badge status={item?.status} />
          <p>Your provider must confirm your rental before payment.</p>
          {item?.status === "CONFIRMED" && <SecureCheckout orderId={id} />}
          <Link href="/dashboard/customer">Back to my rentals</Link>
        </div>
      </DataState>
    </main>
  );
}

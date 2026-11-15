"use client";

import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { Badge } from "@/components/shared/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import type { GearRecord } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export function GearDetails({ id }: { id: string }) {
  const { data, error, loading, reload } = useApiData(`gear/${id}`);
  const item = data?.data as GearRecord | undefined;
  const [image, setImage] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-CA");
  const days =
    start && end
      ? Math.ceil((Date.parse(end) - Date.parse(start)) / 86400000)
      : 0;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const me = await api("auth/me");
      if (me.data.role !== "CUSTOMER")
        throw new Error("Please use a customer account to rent gear.");
      await api("rentals", "POST", {
        gearId: id,
        startDate: start,
        endDate: end,
      });
      router.push("/dashboard/customer");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell section">
      <Link href="/gear">← Back to all gear</Link>
      <DataState loading={loading} error={error} empty={!item} retry={reload}>
        {item && (
          <>
            <div className="detail-layout">
              <div>
                <div className="detail-image">
                  {item.images?.[image] ? (
                    <Image
                      src={item.images[image]}
                      fill
                      alt={item.title || "Gear"}
                      sizes="60vw"
                    />
                  ) : (
                    <div className="placeholder">↗</div>
                  )}
                </div>
                <div className="thumbs">
                  {item.images?.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImage(i)}
                      aria-label={`View image ${i + 1}`}
                      className={image === i ? "selected" : ""}
                    >
                      <Image
                        src={src}
                        width={80}
                        height={65}
                        alt={`Gear view ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
                <h2>Made for your next adventure</h2>
                <p>{item.description}</p>
                <h3>Specifications</h3>
                <dl>
                  {Object.entries(item.specifications || {}).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{String(v)}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  Provided by{" "}
                  <strong>{item.provider?.name || "GearUp provider"}</strong>
                </p>
                <h3>Community reviews</h3>
                {item.reviews?.length ? (
                  item.reviews.map((r) => (
                    <article className="review" key={r.id}>
                      <strong>{r.rating}/5</strong>
                      <p>{r.comment}</p>
                    </article>
                  ))
                ) : (
                  <p>No reviews yet. Be the first after your rental.</p>
                )}
              </div>
              <form className="panel rental-panel" onSubmit={handleSubmit}>
                <div className="eyebrow">
                  {item.category?.name || item.brand}
                </div>
                <h1 className="page-title">{item.title}</h1>
                <p className="big-price">
                  {formatMoney(item.dailyPrice)} <span>/ day</span>
                </p>
                <Badge
                  status={
                    item.isAvailable && (item.availableStock || 0) > 0
                      ? "AVAILABLE"
                      : "UNAVAILABLE"
                  }
                />
                <label>
                  Pick-up date
                  <input
                    required
                    type="date"
                    min={today}
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      setEnd("");
                    }}
                  />
                </label>
                <label>
                  Return date
                  <input
                    required
                    type="date"
                    min={
                      start
                        ? new Date(Date.parse(start) + 86400000)
                            .toISOString()
                            .slice(0, 10)
                        : today
                    }
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>
                <div className="summary-line">
                  <span>Rental · {Math.max(0, days)} days</span>
                  <b>
                    {formatMoney(Math.max(0, days) * (item.dailyPrice || 0))}
                  </b>
                </div>
                <div className="summary-line">
                  <span>Deposit</span>
                  <b>{formatMoney(item.depositAmount)}</b>
                </div>
                <div className="summary-line total">
                  <span>Total</span>
                  <b>
                    {formatMoney(
                      Math.max(0, days) * (item.dailyPrice || 0) +
                        (item.depositAmount || 0),
                    )}
                  </b>
                </div>
                <button
                  className="btn"
                  disabled={
                    busy ||
                    days <= 0 ||
                    !item.isAvailable ||
                    !item.availableStock
                  }
                >
                  {busy ? "Placing request…" : "Request rental ↗"}
                </button>
                <small>
                  Pay after your provider confirms. Stock is checked when you
                  book; a date-specific calendar is not available.
                </small>
                {message && (
                  <p role="alert" className="error">
                    {message} <Link href="/auth/login">Log in</Link>
                  </p>
                )}
              </form>
            </div>
          </>
        )}
      </DataState>
    </main>
  );
}

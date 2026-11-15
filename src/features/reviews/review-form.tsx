"use client";

import { api } from "@/lib/api";
import { useState } from "react";
import type { FormEvent } from "react";

import type { GearRecord } from "@/lib/types";

export function ReviewForm({
  order,
  done,
}: {
  order: GearRecord;
  done: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(event.currentTarget);
      await api("reviews", "POST", {
        rentalOrderId: order.id,
        rating: Number(f.get("rating")),
        comment: f.get("comment"),
      });
      setOpen(false);
      done();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button onClick={() => setOpen(!open)}>Leave review</button>
      {open && (
        <form className="review-form" onSubmit={handleSubmit}>
          <label>
            Rating
            <select name="rating">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Your experience
            <textarea name="comment" required minLength={3} />
          </label>
          <button disabled={busy}>Submit review</button>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </>
  );
}

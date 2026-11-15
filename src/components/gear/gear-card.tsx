"use client";

import { formatMoney } from "@/lib/format";

import type { GearRecord } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

export function GearCard({ item }: { item: GearRecord }) {
  return (
    <Link href={`/gear/${item.id}`} className="gear-card">
      <div className="gear-image">
        {item.images?.[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title || "Rental gear"}
            fill
            sizes="(max-width: 700px) 100vw, 25vw"
          />
        ) : (
          <div className="placeholder">
            ↗<span>Ready for adventure</span>
          </div>
        )}
        <span
          className={`availability ${item.isAvailable && (item.availableStock ?? 0) > 0 ? "" : "unavailable"}`}
        >
          {item.isAvailable && (item.availableStock ?? 0) > 0
            ? "Available"
            : "Unavailable"}
        </span>
      </div>
      <div className="card-info">
        <small>
          {item.category?.name || item.brand || "OUTDOOR ESSENTIALS"}
        </small>
        <h3>{item.title}</h3>
        <div className="price">
          {formatMoney(item.dailyPrice)}
          <span> / day</span>
          <b>↗</b>
        </div>
      </div>
    </Link>
  );
}

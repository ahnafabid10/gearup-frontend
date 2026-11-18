"use client";

import { api, getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { GearRecord } from "@/lib/types";
import Link from "next/link";
import { CategorySuggestions } from "@/features/categories/category-management";

export function GearForm({ id }: { id?: string }) {
  const categories = useApiData("categories");
  const [item, setItem] = useState<GearRecord>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (id)
      api(`gear/${id}`)
        .then((x) => setItem(x.data))
        .catch((e) => setError(e.message));
  }, [id]);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const body = {
      title: formData.get("title"),
      description: formData.get("description"),
      brand: formData.get("brand"),
      categoryId: formData.get("categoryId"),
      dailyPrice: Number(formData.get("dailyPrice")),
      depositAmount: Number(formData.get("depositAmount")),
      totalStock: Number(formData.get("totalStock")),
      isAvailable: formData.get("isAvailable") === "on",
      images: String(formData.get("images"))
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    };
    try {
      if (
        body.images.some((src) => {
          try {
            return new URL(src).protocol !== "https:";
          } catch {
            return true;
          }
        })
      )
        throw new Error("Please enter valid HTTPS image URLs.");
      await api(
        id ? `provider/gear/${id}` : "provider/gear",
        id ? "PUT" : "POST",
        body,
      );
      router.push("/dashboard/provider");
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell section narrow">
      <Link href="/dashboard/provider">← Inventory</Link>
      <h1 className="page-title">
        {id ? "Fine-tune your listing." : "Put your gear to work."}
      </h1>
      {id && !item ? (
        <p role="status">{error || "Loading listing…"}</p>
      ) : (
        <form
          className="panel form-grid"
          key={item?.id || "new"}
          onSubmit={handleSubmit}
        >
          <label>
            Gear name
            <input required name="title" defaultValue={item?.title} />
          </label>
          <label>
            Brand
            <input required name="brand" defaultValue={item?.brand} />
          </label>
          <label>
            Category
            <select name="categoryId" required defaultValue={item?.categoryId}>
              <option value="">Choose category</option>
              {item?.categoryId &&
                !getRows(categories.data).some(
                  (c) => c.id === item.categoryId,
                ) && (
                  <option value={item.categoryId}>
                    {item.category?.name || "Current category"} (inactive —
                    existing listing only)
                  </option>
                )}
              {getRows(categories.data).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="category-field">
            <p>
              Missing a category? Use the suggestion form below. New categories
              need admin approval.
            </p>
            <button
              type="button"
              disabled={categories.loading}
              onClick={categories.reload}
            >
              Refresh categories
            </button>
            {!categories.loading &&
              !categories.error &&
              !getRows(categories.data).length && (
                <p role="status">
                  No active categories yet. Suggest one below before creating a
                  listing.
                </p>
              )}
          </div>
          {["dailyPrice", "depositAmount", "totalStock"].map((n) => (
            <label key={n}>
              {n === "dailyPrice"
                ? "Price per day ($)"
                : n === "depositAmount"
                  ? "Deposit ($)"
                  : "Total stock"}
              <input
                required
                type="number"
                step={n === "totalStock" ? "1" : "0.01"}
                min={n === "dailyPrice" ? "0.01" : "0"}
                name={n}
                defaultValue={
                  item?.[n as "dailyPrice"] ?? (n === "totalStock" ? 1 : 0)
                }
              />
            </label>
          ))}
          <label className="full">
            Description
            <textarea
              required
              name="description"
              defaultValue={item?.description}
            />
          </label>
          <label className="full">
            Image URLs (one HTTPS URL per line)
            <textarea
              name="images"
              defaultValue={item?.images?.join("\n")}
              placeholder="https://example.com/gear.jpg"
            />
          </label>
          <label className="check full">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={item?.isAvailable ?? true}
            />{" "}
            Available for rental
          </label>
          {(error || categories.error) && (
            <p className="error full" role="alert">
              {error || categories.error}
            </p>
          )}
          <button
            className="btn"
            disabled={
              busy ||
              categories.loading ||
              !!categories.error ||
              (!item && !getRows(categories.data).length)
            }
          >
            {busy ? "Saving…" : "Save listing ↗"}
          </button>
        </form>
      )}
      <CategorySuggestions />
    </main>
  );
}

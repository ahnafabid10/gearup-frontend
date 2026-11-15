"use client";

import { getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { GearCard } from "@/components/gear/gear-card";
import { useState } from "react";

export function GearCatalog({
  initialSearch = "",
  initialCategoryId = "",
  initialCategorySlug = "",
}: {
  initialSearch?: string;
  initialCategoryId?: string;
  initialCategorySlug?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategoryId || (initialCategorySlug ? `slug:${initialCategorySlug}` : ""));
  const cats = useApiData("categories");
  const selectedCategory = category.startsWith("slug:")
    ? getRows(cats.data).find(item => item.slug === category.slice(5))?.id || category
    : category;
  const [brand, setBrand] = useState("");
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [available, setAvailable] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const query = new URLSearchParams({
    search,
    categoryId: selectedCategory.startsWith("slug:") ? "" : selectedCategory,
    category: selectedCategory.startsWith("slug:") ? selectedCategory.slice(5) : "",
    brand,
    maxPrice: max,
    minPrice: min,
    isAvailable: available ? "true" : "",
    page: String(page),
    limit: "12",
    sortBy: sort,
    sortOrder: sort === "dailyPrice" ? "asc" : "desc",
  });
  const { data, error, loading, reload } = useApiData(`gear?${query}`);
  return (
    <main className="shell section">
      <div className="eyebrow">THE POSSIBILITIES START HERE</div>
      <h1 className="page-title">Find your next adventure.</h1>
      <p className="muted">Great gear, without the commitment.</p>
      <div className="catalog-layout">
        <aside className="filters">
          <h3>Find your gear</h3>
          <label>
            Search
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tent, bike, paddleboard…"
            />
          </label>
          <label>
            Category
            <select
              value={selectedCategory}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {selectedCategory && !getRows(cats.data).some(item => item.id === selectedCategory) && <option value={selectedCategory}>{initialCategorySlug || "Selected category"}</option>}
              {getRows(cats.data).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          {cats.error && <div role="alert"><p className="error">Categories could not be loaded</p><button type="button" onClick={cats.reload}>Retry categories</button></div>}
          <label>
            Brand
            <input
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              placeholder="Any brand"
            />
          </label>
          <label>
            Minimum daily price
            <input
              type="number"
              min="0"
              value={min}
              placeholder="No minimum"
              onChange={(event) => {
                setMin(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Maximum daily price
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => {
                setMax(e.target.value);
                setPage(1);
              }}
              placeholder="No maximum"
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => {
                setAvailable(e.target.checked);
                setPage(1);
              }}
            />{" "}
            Available now
          </label>
          <button
            className="text-button"
            onClick={() => {
              setSearch("");
              setCategory("");
              setBrand("");
              setMax("");
              setMin("");
              setAvailable(false);
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </aside>
        <div>
          <div className="results-bar">
            <span>
              {data?.meta?.total ?? getRows(data).length} pieces of possibility
            </span>
            <select
              aria-label="Sort gear"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="createdAt">Newest first</option>
              <option value="dailyPrice">Price: low to high</option>
            </select>
          </div>
          <DataState
            loading={loading}
            error={error}
            empty={!getRows(data).length}
            retry={reload}
          >
            <div className="grid catalog-cards">
              {getRows(data).map((x) => (
                <GearCard key={x.id} item={x} />
              ))}
            </div>
          </DataState>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ← Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={page >= (data?.meta?.totalPage || 1)}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

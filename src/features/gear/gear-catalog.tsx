"use client";

import { getRows } from "@/lib/api";
import { useApiData } from "@/hooks/use-api-data";
import { DataState } from "@/components/shared/data-state";
import { GearCard } from "@/components/gear/gear-card";
import { useState } from "react";
import {
  FiFilter,
  FiRotateCcw,
  FiSliders,
} from "react-icons/fi";

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

  const hasActiveFilters = Boolean(search || category || brand || min || max || available);

  const resetAllFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMax("");
    setMin("");
    setAvailable(false);
    setPage(1);
  };

  const totalCount = data?.meta?.total ?? getRows(data).length;

  return (
    <main className="shell section" style={{ paddingTop: "40px" }}>
      {/* Editorial Catalog Hero */}
      <div className="catalog-hero-strip" style={{ marginBottom: "36px" }}>
        <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2e5233" }} />
          <span>COMMUNITY EQUIPMENT MARKETPLACE</span>
        </div>
        <h1 className="page-title" style={{ fontSize: "36px", fontWeight: "650", letterSpacing: "-1px", margin: "0 0 8px 0" }}>
          Find your next adventure.
        </h1>
        <p className="muted" style={{ fontSize: "15px", color: "#5e665d", margin: "0", maxWidth: "600px" }}>
          Rent premium sports, camping, cycling, and outdoor equipment directly from verified local providers.
        </p>
      </div>

      <div className="catalog-layout">
        {/* Modern Filter Sidebar */}
        <aside className="filters">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "16px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0", fontSize: "15px", fontWeight: "600" }}>
              <FiFilter size={15} color="#2e5233" />
              <span>Filter Gear</span>
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                style={{ background: "transparent", border: "none", color: "#6b7768", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <FiRotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          <label>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#3e483e", display: "block", marginBottom: "4px" }}>Search by keyword</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tent, kayak, bike, helmet…"
            />
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#3e483e", display: "block", marginBottom: "4px" }}>Category</span>
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

          {cats.error && (
            <div role="alert" style={{ fontSize: "12px", color: "#8a3c30", margin: "4px 0" }}>
              <span>Categories could not be loaded</span>
            </div>
          )}

          <label>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#3e483e", display: "block", marginBottom: "4px" }}>Brand name</span>
            <input
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              placeholder="Patagonia, Trek, Puma…"
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <label>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#3e483e", display: "block", marginBottom: "4px" }}>Min ($/day)</span>
              <input
                type="number"
                min="0"
                value={min}
                placeholder="0"
                onChange={(event) => {
                  setMin(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#3e483e", display: "block", marginBottom: "4px" }}>Max ($/day)</span>
              <input
                type="number"
                min="0"
                value={max}
                onChange={(e) => {
                  setMax(e.target.value);
                  setPage(1);
                }}
                placeholder="Any"
              />
            </label>
          </div>

          <label className="check" style={{ marginTop: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => {
                setAvailable(e.target.checked);
                setPage(1);
              }}
            />{" "}
            <span style={{ fontSize: "13px", color: "#243c30", fontWeight: "500" }}>Available equipment only</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn small"
              onClick={resetAllFilters}
              style={{ width: "100%", marginTop: "16px", justifyContent: "center", fontSize: "12.5px" }}
            >
              <FiRotateCcw size={13} />
              <span>Clear all filters</span>
            </button>
          )}
        </aside>

        {/* Results Column */}
        <div>
          <div className="results-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f2f5ee", padding: "6px 14px", borderRadius: "20px", fontSize: "12.5px", fontWeight: "600", color: "#2e5233" }}>
              <span>{totalCount} {totalCount === 1 ? "gear listing" : "gear listings"} available</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiSliders size={14} color="#687566" />
              <select
                aria-label="Sort gear"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--line)", fontSize: "13px" }}
              >
                <option value="createdAt">Newest first</option>
                <option value="dailyPrice">Price: low to high</option>
              </select>
            </div>
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

          {data?.meta?.totalPage && data.meta.totalPage > 1 && (
            <div className="pagination" style={{ marginTop: "32px" }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ← Previous
              </button>
              <span>Page {page} of {data.meta.totalPage}</span>
              <button
                disabled={page >= data.meta.totalPage}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

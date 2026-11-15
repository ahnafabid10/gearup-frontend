import { GearCatalog } from "@/features/gear/gear-catalog";
import { Suspense } from "react";
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; category?: string }>;
}) {
  const query = await searchParams;
  return <GearCatalog key={`${query.search || ""}:${query.categoryId || ""}:${query.category || ""}`} initialSearch={query.search || ""} initialCategoryId={query.categoryId || ""} initialCategorySlug={query.category || ""} />;
}
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; category?: string }>;
}) {
  return (
    <Suspense fallback={<p className="shell section">Loading gear…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

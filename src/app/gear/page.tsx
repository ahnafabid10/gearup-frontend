import { GearCatalog } from "@/features/gear/gear-catalog";
import { Suspense } from "react";
async function Content({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return <GearCatalog initialSearch={(await searchParams).search || ""} />;
}
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  return (
    <Suspense fallback={<p className="shell section">Loading gear…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

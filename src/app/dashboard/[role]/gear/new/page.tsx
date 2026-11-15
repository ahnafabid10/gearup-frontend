import { GearForm } from "@/features/inventory/gear-form";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  if ((await params).role !== "provider") notFound();
  return <GearForm />;
}

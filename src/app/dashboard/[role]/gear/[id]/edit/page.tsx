import { GearForm } from "@/features/inventory/gear-form";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; role: string }>;
}) {
  const { id, role } = await params;
  if (role !== "provider") notFound();
  return <GearForm id={id} />;
}

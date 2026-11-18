import { CategoryManagement } from "@/features/categories/category-management";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!["admin", "provider"].includes(role)) redirect(`/dashboard/${role}`);
  return <CategoryManagement role={role} />;
}

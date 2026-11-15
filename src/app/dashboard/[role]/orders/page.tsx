import { Dashboard } from "@/features/dashboard/dashboard";
export default async function Page({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  return <Dashboard role={role} view="orders" />;
}

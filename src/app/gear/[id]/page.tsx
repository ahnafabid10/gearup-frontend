import { GearDetails } from "@/features/gear/gear-details";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GearDetails id={id} />;
}

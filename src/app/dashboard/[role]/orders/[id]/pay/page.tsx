import { RentalPayment } from "@/features/payment/rental-payment";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; role: string }>;
}) {
  const { id, role } = await params;
  if (role !== "customer") notFound();
  return <RentalPayment id={id} />;
}

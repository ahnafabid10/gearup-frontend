import { Suspense } from "react";
import { PaymentResult } from "@/features/payment/secure-checkout";

export default function Page() {
  return (
    <Suspense fallback={<div className="shell section narrow"><p>Loading checkout status…</p></div>}>
      <PaymentResult cancel />
    </Suspense>
  );
}

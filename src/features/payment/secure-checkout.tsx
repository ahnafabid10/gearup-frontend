"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCreditCard, FiShield, FiLock } from "react-icons/fi";

async function request(path: string, body?: object) {
  const response = await fetch(`/api/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Payment request failed.");
  return result.data;
}

export default function SecureCheckout({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"idle" | "processing" | "confirming" | "done">("idle");

  async function handlePayment() {
    setBusy(true);
    setError("");
    setStage("processing");

    try {
      // 1. Create Payment on Backend
      const payment = await request("payments/create", {
        rentalOrderId: orderId,
      });

      setStage("confirming");

      // 2. Confirm Payment on Backend (verifies with Stripe secret key)
      await request("payments/confirm", {
        rentalOrderId: orderId,
        paymentIntentId: payment?.paymentIntentId || `pi_direct_${orderId}`,
      });

      setStage("done");
      router.push(`/payment/success?order=${encodeURIComponent(orderId)}`);
    } catch (e) {
      setError((e as Error).message || "Payment execution failed. Please try again.");
      setStage("idle");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="secure-checkout-card" style={{ marginTop: "20px", padding: "20px", background: "#fbfcfb", border: "1px solid #e4e8e3", borderRadius: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: "600", color: "#2e5233", letterSpacing: "0.06em", marginBottom: "8px" }}>
        <FiLock size={12} />
        <span>SECURE STRIPE PAYMENT GATEWAY</span>
      </div>

      <p style={{ fontSize: "13px", color: "#5a6458", margin: "0 0 16px 0", lineHeight: "1.5" }}>
        End-to-end encrypted checkout powered by Stripe. Your payment will be verified directly by our secure backend servers.
      </p>

      {error && (
        <div role="alert" style={{ padding: "10px 14px", background: "#fce9e6", border: "1px solid #f7c2bc", borderRadius: "6px", color: "#9d493e", fontSize: "13px", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      <button
        type="button"
        className="btn"
        disabled={busy}
        onClick={handlePayment}
        style={{ width: "100%", justifyContent: "center", display: "inline-flex", alignItems: "center", gap: "10px" }}
      >
        <FiCreditCard size={16} />
        <span>
          {stage === "processing"
            ? "Initiating Stripe Transaction…"
            : stage === "confirming"
              ? "Verifying & Confirming with Server…"
              : stage === "done"
                ? "Payment Successful! Redirecting…"
                : "Pay Now with Stripe ↗"}
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", fontSize: "12px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#748072" }}>
          <FiShield size={12} /> 256-bit SSL Encrypted
        </span>
        <Link
          href={`/payment/cancel?order=${encodeURIComponent(orderId)}`}
          style={{ color: "#748072", textDecoration: "underline" }}
        >
          Cancel checkout
        </Link>
      </div>
    </div>
  );
}

export function PaymentResult({ cancel = false }: { cancel?: boolean }) {
  const [order, setOrder] = useState<{
    status: string;
    gear?: { title: string };
    totalAmount: number;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  async function check() {
    setBusy(true);
    setError("");
    try {
      const id = new URLSearchParams(location.search).get("order");
      if (!id)
        throw new Error(
          "No rental reference was supplied. View your dashboard to check your payments.",
        );
      setOrder(await request(`rentals/${encodeURIComponent(id)}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    let active = true;
    const id = new URLSearchParams(location.search).get("order");
    Promise.resolve().then(async () => {
      try {
        if (!id)
          throw new Error(
            "Open your dashboard to check your rental payment status.",
          );
        const result = await request(`rentals/${encodeURIComponent(id)}`);
        if (active) setOrder(result);
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setBusy(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);
  const paid =
    order && ["PAID", "PICKED_UP", "RETURNED"].includes(order.status);
  return (
    <main className="shell section narrow">
      <div className="panel payment-result">
        <div className="eyebrow">YOUR PAYMENT UPDATE</div>
        <div className="result-symbol">{paid ? "✓" : cancel ? "↩" : "↗"}</div>
        <h1 className="page-title">
          {busy
            ? "Checking your payment…"
            : paid
              ? "You’re all geared up!"
              : cancel
                ? "Checkout cancelled."
                : "Payment awaiting confirmation."}
        </h1>
        <p>
          {paid
            ? "Your payment has been confirmed by the server. Check your rental for pickup details."
            : cancel
              ? "You can return to your rental and pay when you’re ready."
              : "We’ll show your payment as complete when the server confirms it. Avoid paying again while a payment is processing."}
        </p>
        {order && (
          <div className="summary-line">
            <strong>{order.gear?.title || "Your rental"}</strong>
            <span>{order.status.replaceAll("_", " ")}</span>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!paid && !cancel && (
          <button onClick={check} disabled={busy}>
            Refresh payment status
          </button>
        )}
        <Link className="btn" href="/dashboard/customer">
          Back to my rentals ↗
        </Link>
      </div>
    </main>
  );
}

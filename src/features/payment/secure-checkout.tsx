"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCreditCard, FiShield, FiLock, FiExternalLink } from "react-icons/fi";

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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"idle" | "processing" | "redirecting">("idle");

  async function handlePayment() {
    setBusy(true);
    setError("");
    setStage("processing");

    try {
      // 1. Request Stripe Hosted Checkout Session from Backend
      const result = await request("payments/checkout-session", {
        rentalOrderId: orderId,
      });

      if (!result?.checkoutUrl) {
        throw new Error("Unable to create Stripe checkout session. Please try again.");
      }

      setStage("redirecting");

      // 2. Redirect browser directly to Stripe Hosted Checkout
      window.location.href = result.checkoutUrl;
    } catch (e) {
      setError((e as Error).message || "Payment initiation failed. Please try again.");
      setStage("idle");
      setBusy(false);
    }
  }

  return (
    <div className="secure-checkout-card" style={{ marginTop: "20px", padding: "20px", background: "#fbfcfb", border: "1px solid #e4e8e3", borderRadius: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: "600", color: "#2e5233", letterSpacing: "0.06em", marginBottom: "8px" }}>
        <FiLock size={12} />
        <span>SECURE STRIPE HOSTED CHECKOUT</span>
      </div>

      <p style={{ fontSize: "13px", color: "#5a6458", margin: "0 0 16px 0", lineHeight: "1.5" }}>
        You will be redirected to Stripe’s secure hosted checkout page to enter your payment details. Once completed, you will be redirected back here with instant confirmation.
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
            ? "Connecting to Stripe…"
            : stage === "redirecting"
              ? "Redirecting to Stripe Checkout…"
              : "Pay Now with Stripe ↗"}
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", fontSize: "12px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#748072" }}>
          <FiShield size={12} /> 256-bit SSL Encrypted by Stripe
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
      const params = new URLSearchParams(location.search);
      const id = params.get("order");
      const sessionId = params.get("session_id");
      if (!id)
        throw new Error(
          "No rental reference was supplied. View your dashboard to check your payments.",
        );

      if (sessionId && !cancel) {
        try {
          await request("payments/verify-session", {
            rentalOrderId: id,
            sessionId,
          });
        } catch {
          // If already verified or webhook handled it, continue
        }
      }

      const res = await request(`rentals/${encodeURIComponent(id)}`);
      setOrder(res?.data || res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(location.search);
    const id = params.get("order");
    const sessionId = params.get("session_id");

    Promise.resolve().then(async () => {
      try {
        if (!id)
          throw new Error(
            "Open your dashboard to check your rental payment status.",
          );

        // Auto-verify Stripe checkout session on landing
        if (sessionId && !cancel) {
          try {
            await request("payments/verify-session", {
              rentalOrderId: id,
              sessionId,
            });
          } catch (verifyErr) {
            console.warn("Session verification notice:", verifyErr);
          }
        }

        const result = await request(`rentals/${encodeURIComponent(id)}`);
        if (active) setOrder(result?.data || result);
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setBusy(false);
      }
    });

    return () => {
      active = false;
    };
  }, [cancel]);

  const paid =
    order && ["PAID", "PICKED_UP", "RETURNED"].includes(order.status);

  return (
    <main className="shell section narrow">
      <div className="panel payment-result">
        <div className="eyebrow">YOUR PAYMENT UPDATE</div>
        <div className="result-symbol">{paid ? "✓" : cancel ? "↩" : "↗"}</div>
        <h1 className="page-title">
          {busy
            ? "Verifying your payment with Stripe…"
            : paid
              ? "You’re all geared up!"
              : cancel
                ? "Checkout cancelled."
                : "Payment awaiting confirmation."}
        </h1>
        <p>
          {paid
            ? "Your payment has been successfully confirmed and verified by Stripe. Check your rental for pickup details."
            : cancel
              ? "You cancelled the Stripe checkout. You can return to your rental dashboard and pay when you’re ready."
              : "We’ll show your payment as complete once verified. Avoid paying again while a transaction is in flight."}
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

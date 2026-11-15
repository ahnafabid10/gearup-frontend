"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Intent = { id: string; status: string };
type StripeElement = {
  mount(node: HTMLElement): void;
  destroy(): void;
  on(event: string, cb: () => void): void;
};
type Elements = { create(type: "payment"): StripeElement };
type StripeClient = {
  elements(options: { clientSecret: string; appearance: object }): Elements;
  confirmPayment(options: {
    elements: Elements;
    confirmParams: { return_url: string };
    redirect: "if_required";
  }): Promise<{ error?: { message?: string }; paymentIntent?: Intent }>;
};
declare global {
  interface Window {
    Stripe?: (key: string) => StripeClient;
  }
}
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
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const client = useRef<StripeClient | null>(null);
  const elements = useRef<Elements | null>(null);
  useEffect(() => {
    if (!secret || !loaded || !key || !window.Stripe || !mount.current) return;
    let active = true;
    let paymentElement: StripeElement | undefined;
    // Stripe owns this DOM node; dispose its element when the checkout changes.
    Promise.resolve()
      .then(() => {
        if (!active || !window.Stripe || !mount.current) return;
        client.current = window.Stripe(key);
        elements.current = client.current.elements({
          clientSecret: secret,
          appearance: {
            theme: "stripe",
            variables: { colorPrimary: "#355a38", borderRadius: "7px" },
          },
        });
        const element = elements.current.create("payment");
        paymentElement = element;
        element.on("ready", () => setReady(true));
        element.on("loaderror", () =>
          setError(
            "Payment form could not load. Please refresh and try again.",
          ),
        );
        element.mount(mount.current);
      })
      .catch((error: Error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
      paymentElement?.destroy();
      elements.current = null;
      client.current = null;
    };
  }, [secret, loaded, key]);
  async function prepare() {
    setBusy(true);
    setError("");
    try {
      const payment = await request("payments/create", {
        rentalOrderId: orderId,
      });
      if (!payment.clientSecret || payment.clientSecret.includes("mock"))
        throw new Error(
          "Online payments are not configured by this provider yet. No charge has been made.",
        );
      setSecret(payment.clientSecret);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function pay() {
    if (!client.current || !elements.current) return;
    setBusy(true);
    setError("");
    try {
      const result = await client.current.confirmPayment({
        elements: elements.current,
        confirmParams: {
          return_url: `${location.origin}/payment/success?order=${encodeURIComponent(orderId)}`,
        },
        redirect: "if_required",
      });
      if (result.error)
        throw new Error(
          result.error.message || "Please check your payment details.",
        );
      if (result.paymentIntent?.status === "succeeded") {
        await request("payments/confirm", {
          rentalOrderId: orderId,
          paymentIntentId: result.paymentIntent.id,
        });
        router.push(`/payment/success?order=${encodeURIComponent(orderId)}`);
      } else
        setError(
          "Your payment is processing. Check your rental for the latest payment status before trying again.",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="secure-checkout">
      {key && (
        <Script
          src="https://js.stripe.com/v3/"
          onReady={() => setLoaded(true)}
          onError={() =>
            setError(
              "Unable to connect to Stripe. Please check your connection.",
            )
          }
        />
      )}
      <p className="checkout-security">
        Secure checkout · Card details are collected directly by Stripe.
      </p>
      {!key ? (
        <p className="notice">
          Online checkout is not available yet. Please contact your provider to
          arrange payment.
        </p>
      ) : !secret ? (
        <button className="btn" disabled={busy} onClick={prepare}>
          {busy ? "Preparing secure checkout…" : "Continue to secure payment ↗"}
        </button>
      ) : (
        <>
          <div ref={mount} className="stripe-element" />
          {!ready && !error && (
            <p role="status">Loading secure payment form…</p>
          )}
          <button className="btn" disabled={!ready || busy} onClick={pay}>
            {busy ? "Processing payment…" : "Pay securely ↗"}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Link href={`/payment/cancel?order=${encodeURIComponent(orderId)}`}>
        Cancel checkout
      </Link>
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

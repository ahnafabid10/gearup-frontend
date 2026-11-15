"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Link from "next/link";
import type { FormEvent } from "react";

export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (register) {
        await api("auth/register", "POST", body);
        router.push("/auth/login?registered=1");
      } else {
        const result = await api("auth/login", "POST", body);
        router.push(`/dashboard/${result.data.user.role.toLowerCase()}`);
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell auth-layout">
      <div className="auth-story">
        <div className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</div>
        <h1>
          Less owning.
          <br />
          <em>More living.</em>
        </h1>
        <p>Your next great story starts with the right gear.</p>
        <div className="auth-mark">↗</div>
      </div>
      <form onSubmit={submit} className="panel auth-form">
        <h2>{register ? "Adventure starts here." : "Welcome back."}</h2>
        <p>
          {register
            ? "Create your GearUp account."
            : "Log in and pick up where you left off."}
        </p>
        {register && (
          <>
            <label>
              Your name
              <input name="name" required minLength={2} autoComplete="name" />
            </label>
            <label>
              I want to
              <select name="role">
                <option value="CUSTOMER">Rent gear — Customer</option>
                <option value="PROVIDER">List my gear — Provider</option>
              </select>
            </label>
          </>
        )}
        <label>
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account ↗" : "Log in ↗"}
        </button>
        <p>
          {register ? "Already part of the adventure?" : "New around here?"}{" "}
          <Link href={register ? "/auth/login" : "/auth/register"}>
            {register ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}

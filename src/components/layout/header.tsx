"use client";

import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { GearRecord } from "@/lib/types";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<GearRecord>();
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    api("auth/me")
      .then((x) => setUser(x.data))
      .catch(() => setUser(undefined));
  }, [path]);
  return (
    <>
      <div className="announcement">
        The best things in life aren’t things.
        <Link href="/gear">Rent the gear. Keep the memories ↗</Link>
      </div>
      <header className="header shell">
        <Link className="logo" href="/">
          gearup<span>↗</span>
        </Link>
        <button className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close −" : "Menu +"}</button>
        <nav id="main-navigation" className={menuOpen ? "nav-open" : ""} aria-label="Main navigation" onClick={() => setMenuOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}>
          <Link href="/gear">Explore gear</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#why-gearup">For providers</Link>
          <Link className="mobile-login" href="/auth/login">Log in</Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link
                className="btn small"
                href={`/dashboard/${user.role?.toLowerCase()}`}
              >
                My dashboard ↗
              </Link>
              <button
                className="text-button"
                onClick={async () => {
                  await api("auth/logout", "POST");
                  setUser(undefined);
                  router.push("/");
                  router.refresh();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Log in</Link>
              <Link className="btn small" href="/auth/register">
                Get started ↗
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}

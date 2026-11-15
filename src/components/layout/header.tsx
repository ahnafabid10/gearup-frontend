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
  useEffect(() => {
    api("auth/me")
      .then((x) => setUser(x.data))
      .catch(() => setUser(undefined));
  }, [path]);
  return (
    <>
      <div className="announcement">
        A little less owning. A lot more exploring.{" "}
        <span>Make your next adventure happen ↗</span>
      </div>
      <header className="header shell">
        <Link className="logo" href="/">
          gearup<span>↗</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/gear">Explore gear</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#why-gearup">Why GearUp</Link>
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

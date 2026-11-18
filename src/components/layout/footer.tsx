"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname() || "";

  // Hide footer when user is inside the dashboard workspace
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="footer-wrap">
      <div className="shell footer">
        <div>
          <Link className="logo" href="/">
            gearup<span>↗</span>
          </Link>
          <p>
            A little less owning.
            <br />A lot more living.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/gear">Explore gear</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/auth/register">Become a provider</Link>
        </nav>
        <div className="footer-end">
          <span>Go make a memory ↗</span>
          <small>© 2026 GearUp</small>
        </div>
      </div>
    </footer>
  );
}

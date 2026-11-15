"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="shell footer">
      <Link className="logo" href="/">
        gearup<span>↗</span>
      </Link>
      <p>Good gear. Great outdoors. More possibilities.</p>
      <Link href="/gear">Find your next adventure ↗</Link>
      <small>© {new Date().getFullYear()} GearUp</small>
    </footer>
  );
}

"use client";

import { api } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { GearRecord } from "@/lib/types";
import Link from "next/link";
import {
  FiMenu,
  FiX,
  FiCompass,
  FiGrid,
  FiLogOut,
  FiUser,
} from "react-icons/fi";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<GearRecord>();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentPath = pathname || "";
  const isDashboard = currentPath.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return;
    api("auth/me")
      .then((x) => setUser(x.data))
      .catch(() => setUser(undefined));
  }, [isDashboard]);

  // Close mobile navigation on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile navigation is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Hide public navigation header when user is inside dashboard workspace
  if (isDashboard) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await api("auth/logout", "POST");
      setUser(undefined);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      setUser(undefined);
      setMenuOpen(false);
      router.push("/");
    }
  };

  const role = user?.role?.toLowerCase() || "customer";

  return (
    <>
      <div className="announcement">
        <span className="announcement-text">
          The best things in life aren’t things.
        </span>
        <Link href="/gear">Rent the gear. Keep the memories ↗</Link>
      </div>

      <header className="header shell">
        <Link className="logo" href="/" onClick={() => setMenuOpen(false)}>
          gearup<span>↗</span>
        </Link>

        {/* Desktop Navigation Links (Unslop Quiet Chrome) */}
        <nav
          id="main-navigation"
          className="header-desktop-nav"
          aria-label="Main navigation"
        >
          <Link
            href="/gear"
            className={currentPath === "/gear" ? "active" : ""}
          >
            Explore gear
          </Link>
          <Link
            href="/#how-it-works"
            className={currentPath === "/#how-it-works" ? "active" : ""}
          >
            How it works
          </Link>
          <Link
            href="/#why-gearup"
            className={currentPath === "/#why-gearup" ? "active" : ""}
          >
            For providers
          </Link>
        </nav>

        {/* Action Controls & Mobile Toggle */}
        <div className="header-actions">
          {user ? (
            <>
              <Link
                className="btn small header-dashboard-btn"
                href={`/dashboard/${role}`}
              >
                My dashboard ↗
              </Link>
              <button
                type="button"
                className="text-button header-signout-btn"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="header-login-link">
                Log in
              </Link>
              <Link
                className="btn small header-register-btn"
                href="/auth/register"
              >
                Get started ↗
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle Button (44px touch target) */}
          <button
            type="button"
            className="menu-toggle"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Backdrop for Mobile Navigation Overlay */}
        {menuOpen && (
          <div
            className="header-mobile-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation Drawer / Dropdown */}
        <div
          id="mobile-navigation"
          className={`header-mobile-drawer ${menuOpen ? "nav-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="mobile-drawer-inner">
            <div className="mobile-drawer-section">
              <span className="mobile-section-label">NAVIGATION</span>
              <nav className="mobile-drawer-nav">
                <Link
                  href="/gear"
                  className={`mobile-nav-link ${currentPath === "/gear" ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FiCompass size={17} />
                  <span>Explore gear</span>
                </Link>
                <Link
                  href="/#how-it-works"
                  className={`mobile-nav-link ${currentPath === "/#how-it-works" ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>How it works</span>
                </Link>
                <Link
                  href="/#why-gearup"
                  className={`mobile-nav-link ${currentPath === "/#why-gearup" ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>For providers</span>
                </Link>
              </nav>
            </div>

            <div className="mobile-drawer-divider" />

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">ACCOUNT</span>
              {user ? (
                <div className="mobile-account-block">
                  <div className="mobile-user-card">
                    <div className="mobile-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="mobile-user-details">
                      <strong>{user.name || "Explorer"}</strong>
                      <small>{user.email}</small>
                    </div>
                    <span className="mobile-role-badge">
                      {role.toUpperCase()}
                    </span>
                  </div>

                  <div className="mobile-user-actions">
                    <Link
                      className="btn small mobile-primary-btn"
                      href={`/dashboard/${role}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FiGrid size={15} />
                      <span>My dashboard ↗</span>
                    </Link>

                    <button
                      type="button"
                      className="mobile-signout-btn"
                      onClick={handleSignOut}
                    >
                      <FiLogOut size={15} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mobile-guest-actions">
                  <Link
                    href="/auth/login"
                    className="mobile-login-btn"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiUser size={15} />
                    <span>Log in</span>
                  </Link>
                  <Link
                    className="btn small mobile-primary-btn"
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>Get started ↗</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

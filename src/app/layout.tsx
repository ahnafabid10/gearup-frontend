import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./outdoor.css";
import "./dashboard.css";
import { Toast } from "@/components/shared/toast";
export const metadata: Metadata = {
  title: {
    default: "GearUp — More adventure. Less owning.",
    template: "%s | GearUp",
  },
  description:
    "Rent quality sports and outdoor gear from local providers. Find your next adventure with GearUp.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip" href="#main-content">
          Skip to content
        </a>
        <Suspense fallback={<header className="header shell" aria-label="Loading navigation"><span className="logo">gearup<span>↗</span></span></header>}>
          <Header />
        </Suspense>
        <div id="main-content">{children}</div>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}

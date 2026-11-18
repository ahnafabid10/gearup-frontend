import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

async function DashboardContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const token = (await cookies()).get("accessToken")?.value;
  let user;
  try {
    const base = (
      process.env.GEARUP_API_URL ||
      process.env.NEXT_PUBLIC_GEARUP_API_URL ||
      "http://localhost:5000"
    ).trim().replace(/\/+$/, "");
    const response = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(45000),
    });
    const result = await response.json();
    user = result.data;
  } catch {
    return (
      <main className="shell section">
        <h1>Connection unavailable</h1>
        <p>Please check your connection and refresh to open your dashboard.</p>
      </main>
    );
  }
  if (!user?.role) redirect("/auth/login");
  if (user.role.toLowerCase() !== role)
    redirect(`/dashboard/${user.role.toLowerCase()}`);

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

export default function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  return (
    <Suspense
      fallback={<main className="shell section">Opening your dashboard…</main>}
    >
      <DashboardContent {...props} />
    </Suspense>
  );
}

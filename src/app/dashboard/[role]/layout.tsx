import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    const response = await fetch(
      `${process.env.GEARUP_API_URL || "http://localhost:5000"}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
    );
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
  return children;
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

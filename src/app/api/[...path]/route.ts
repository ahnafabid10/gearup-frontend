import { NextRequest, NextResponse } from "next/server";
async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (req.method !== "GET" && req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  if (path.join("/") === "auth/logout") {
    const out = NextResponse.json({ success: true });
    out.cookies.delete("accessToken");
    out.cookies.delete("refreshToken");
    return out;
  }
  try {
    const base = (
      process.env.GEARUP_API_URL || process.env.NEXT_PUBLIC_GEARUP_API_URL ||
      (process.env.NODE_ENV !== "production" ? "http://localhost:5000" : "")
    ).trim().replace(/\/+$/, "");
    if (!base) {
      console.error("GearUp proxy: backend URL environment variable is missing");
      return NextResponse.json(
        { message: "Backend URL is not configured.", code: "BACKEND_URL_MISSING" },
        { status: 503 },
      );
    }
    const token = req.cookies.get("accessToken")?.value;
    const upstream = await fetch(
      `${base}/api/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`,
      {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(req.method !== "GET" ? { body: await req.text() } : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(45000),
      },
    );
    const data = await upstream.json();
    const tokens =
      path.join("/") === "auth/login" && upstream.ok ? { ...data.data } : null;
    if (tokens) {
      delete data.data.accessToken;
      delete data.data.refreshToken;
    }
    const out = NextResponse.json(data, { status: upstream.status });
    if (tokens) {
      for (const name of ["accessToken", "refreshToken"] as const) {
        const value = tokens[name];
        if (value)
          out.cookies.set(name, value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: name === "accessToken" ? 86400 : 604800,
          });
      }
    }
    return out;
  } catch (error) {
    const failure = error instanceof Error ? error : new Error("Unknown proxy error");
    const cause = failure.cause as { code?: string } | undefined;
    const code = failure.name === "TimeoutError"
      ? "BACKEND_TIMEOUT"
      : failure instanceof SyntaxError
        ? "BACKEND_INVALID_JSON"
        : "BACKEND_CONNECTION_FAILED";
    console.error("GearUp proxy failed", {
      path: path.join("/"),
      code,
      errorName: failure.name,
      networkCode: cause?.code,
    });
    return NextResponse.json(
      { message: "Unable to reach GearUp. Please try again shortly.", code },
      { status: 502 },
    );
  }
}
export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};

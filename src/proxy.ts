import { NextRequest, NextResponse } from "next/server";
export function proxy(req: NextRequest) {
  if (!req.cookies.get("accessToken"))
    return NextResponse.redirect(new URL("/auth/login", req.url));
  return NextResponse.next();
}
export const config = { matcher: "/dashboard/:path*" };

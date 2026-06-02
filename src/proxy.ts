import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("auth_session");

  // Redirect unauthenticated users away from protected routes
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Skip login page for authenticated users — send them straight to dashboard
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Send unauthenticated root visitors to login
  if (pathname === "/" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/login"],
};


import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get("token")?.value;

  if (!token) return false;

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authenticated = isAuthenticated(request);

  // Routes only logged-in users can access
  const isGuestRoute =
    pathname === "/login" || pathname === "/signup";

  // Logged-in users cannot visit login/signup
  if (authenticated && isGuestRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // All other pages require authentication
  if (!authenticated && !isGuestRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

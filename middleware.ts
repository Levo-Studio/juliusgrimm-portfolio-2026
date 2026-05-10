import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const middleware = (request: NextRequest): NextResponse => {
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://api.github.com"
  );

  if (request.nextUrl.pathname.startsWith("/admin") && !request.cookies.get("admin_csrf")?.value) {
    response.cookies.set("admin_csrf", crypto.randomUUID().replace(/-/g, ""), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/"
    });
  }

  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

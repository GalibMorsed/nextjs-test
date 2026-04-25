import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATH_PREFIXES = [
  "/notes",
  "/personalization",
  "/settings",
  "/appearance",
  "/my-activity",
  "/explore",
  "/plans",
];

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Content-Security-Policy": "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
};

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

async function hasValidSession(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !anonKey || !token) return false;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPath = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isProtectedPath) {
    return applySecurityHeaders(NextResponse.next());
  }

  const accessToken =
    request.cookies.get("sb-access-token")?.value ??
    request.cookies.get("auth_token")?.value ??
    "";

  if (!accessToken || !(await hasValidSession(accessToken))) {
    const loginUrl = new URL("/auth/register", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon0.svg|icon1.png|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json)$).*)",
  ],
};

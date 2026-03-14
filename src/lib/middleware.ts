import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function hasValidSession(req: NextRequest, token: string) {
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken =
    req.cookies.get("sb-access-token")?.value ??
    req.cookies.get("auth_token")?.value ??
    "";
  const isProtected =
    pathname.startsWith("/notes") ||
    pathname.startsWith("/personalization") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/appearance");

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!accessToken || !(await hasValidSession(req, accessToken))) {
    const loginUrl = new URL("/auth/register", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/notes/:path*",
    "/personalization/:path*",
    "/settings/:path*",
    "/appearance/:path*",
  ],
};

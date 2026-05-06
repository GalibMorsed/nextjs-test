import { NextResponse } from "next/server";

const FALLBACK_IMAGE_PATH = "/news1.jpg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
  }

  try {
    // Remote news images can be very large; avoid buffering and avoid Next's fetch
    // data cache (which refuses items >2MB and can trigger errors).
    const upstream = await fetch(parsed.toString(), {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: parsed.origin,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!upstream.ok) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const cacheControl =
      upstream.headers.get("cache-control") ||
      "public, max-age=3600, stale-while-revalidate=86400";

    const body = upstream.body;
    if (!body) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch {
    return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
  }
}

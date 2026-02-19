import { NextResponse } from "next/server";

const FALLBACK_IMAGE_PATH = "/news.avif";

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
    const upstream = await fetch(parsed.toString(), {
      next: { revalidate: 1800 },
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return NextResponse.redirect(new URL(FALLBACK_IMAGE_PATH, req.url));
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const cacheControl =
      upstream.headers.get("cache-control") ||
      "public, max-age=3600, stale-while-revalidate=86400";

    const body = await upstream.arrayBuffer();

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

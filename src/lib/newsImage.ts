export function getNewsImageSrc(url?: string | null): string {
  if (!url) return "/news.avif";

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "/news.avif";
    }

    return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return "/news.avif";
  }
}

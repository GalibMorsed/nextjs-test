export function getNewsImageSrc(url?: string | null): string {
  if (!url) return "/news1.jpg";

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "/news1.jpg";
    }

    return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return "/news1.jpg";
  }
}

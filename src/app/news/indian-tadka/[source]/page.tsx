import IndianTadkaContent from "./IndianTadkaContent";
import { headers } from "next/headers";

interface Article {
  source?: { id?: string | null; name?: string };
  author?: string | null;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
}

async function getIndianTadkaNews(source: string) {
  const requestHeaders = await headers();
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const baseUrl =
    envBaseUrl || (host ? `${protocol}://${host}` : "http://localhost:3000");
  const requestUrl = new URL("/api/news/indian-tadka", baseUrl);
  requestUrl.searchParams.set("source", source);

  try {
    const res = await fetch(requestUrl.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch news for source: ${source}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching Indian Tadka news:", error);
    return { articles: [] };
  }
}

export default async function IndianTadkaPage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;
  const data = await getIndianTadkaNews(source);
  const articles: Article[] = data.articles ?? [];

  return (
    <main className="p-6">
      <IndianTadkaContent source={source} initialArticles={articles} />
    </main>
  );
}

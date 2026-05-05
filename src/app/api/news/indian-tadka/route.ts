import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { enforceRateLimit, getClientIp } from "@/lib/apiSecurity";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["description", "description"],
    ],
  },
});

interface RSSItem extends Parser.Item {
  mediaContent?: Array<{ $: { url: string } }>;
  enclosure?: { url: string };
  description?: string;
  author?: string;
}

const INDIAN_NEWS_FEEDS: Record<string, string> = {
  ndtv: "https://feeds.feedburner.com/ndtvnews-top-stories",
  "times-of-india": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  "hindustan-times": "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
  "indian-express": "https://indianexpress.com/feed/",
  "the-hindu": "https://www.thehindu.com/news/feeder/default.rss",
};

const SOURCE_NAMES: Record<string, string> = {
  ndtv: "NDTV News",
  "times-of-india": "Times of India",
  "hindustan-times": "Hindustan Times",
  "indian-express": "Indian Express",
  "the-hindu": "The Hindu",
};

export async function GET(req: Request) {
  try {
    // 1. Rate Limiting (30 requests per minute per IP for RSS)
    const ip = getClientIp(req);
    const ratelimit = enforceRateLimit(`indian_tadka_${ip}`, 30, 60 * 1000);
    if (!ratelimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ratelimit.retryAfterSeconds) } }
      );
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || searchParams.get("category");

    if (!source || !INDIAN_NEWS_FEEDS[source]) {
      return NextResponse.json(
        { error: "Invalid or missing source parameter" },
        { status: 400 }
      );
    }

    const feedUrl = INDIAN_NEWS_FEEDS[source];

    // 2. Fetch with Caching (revalidate every 5 minutes)
    const res = await fetch(feedUrl, { 
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000) // 8s timeout for RSS
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch RSS feed: ${res.statusText}`);
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);

    const articles = feed.items.map((rawItem) => {
      const item = rawItem as RSSItem;
      // Try to extract image URL
      let imageUrl = "";
      
      // Check media:content (common in many feeds)
      if (item.mediaContent && item.mediaContent.length > 0 && item.mediaContent[0].$) {
        imageUrl = item.mediaContent[0].$.url;
      } 
      // Check enclosure (another common way)
      else if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      }
      // Fallback: try to find img tag in description if available
      else if (item.description && item.description.includes("<img")) {
        const match = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (match) imageUrl = match[1];
      }

      // Clean up description (remove HTML tags if any)
      const cleanDescription = item.description 
        ? item.description.replace(/<[^>]*>?/gm, "").substring(0, 200).trim() + "..."
        : "";

      return {
        source: { id: source, name: SOURCE_NAMES[source] },
        author: item.creator || item.author || SOURCE_NAMES[source],
        title: item.title,
        description: cleanDescription,
        content: item.contentSnippet || item.content || cleanDescription,
        url: item.link,
        urlToImage: imageUrl,
        publishedAt: item.isoDate || item.pubDate,
      };
    });

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error: any) {
    console.error("Indian Tadka API Error:", error);
    const status = error.name === "TimeoutError" ? 504 : 500;
    const message = error.name === "TimeoutError"
      ? "The news source took too long to respond. Please try again."
      : "Failed to fetch or parse news from this source.";
      
    return NextResponse.json({ error: message }, { status });
  }
}

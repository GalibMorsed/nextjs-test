import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  getClientIp,
  isTrustedSameOriginRequest,
} from "@/lib/apiSecurity";

type DailymotionVideo = {
  id?: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  duration?: number;
  views_total?: number;
  created_time?: number;
  "owner.screenname"?: string;
  "owner.avatar_60_url"?: string;
};

type DailymotionResponse = {
  list?: DailymotionVideo[];
  has_more?: boolean;
  total?: number;
  error?: {
    message?: string;
  };
};

let cachedToken: string | null = null;
let tokenExpiry = 0;
const MAX_PAGE = 5;
const SHORTS_RATE_LIMIT = 30;
const SHORTS_RATE_WINDOW_MS = 60 * 1000;

const INDIA_KEYWORDS = [
  "india",
  "indian",
  "bharat",
  "delhi",
  "mumbai",
  "bengaluru",
  "hyderabad",
  "chennai",
  "kolkata",
  "pune",
  "modi",
  "government of india",
];

const categoryConfigs: Record<
  string,
  {
    query: string;
    keywords: string[];
  }
> = {
  "top-stories": {
    query: "india top stories breaking news today",
    keywords: ["breaking", "headline", "top story", "top stories", "latest"],
  },
  world: {
    query: "india world news international affairs today",
    keywords: ["world", "international", "global", "foreign", "diplomacy"],
  },
  politics: {
    query: "india politics news today",
    keywords: ["politics", "political", "government", "parliament", "election", "policy"],
  },
  business: {
    query: "india business news today",
    keywords: ["business", "market", "company", "corporate", "startup", "trade"],
  },
  climate: {
    query: "india climate environment news today",
    keywords: ["climate", "environment", "pollution", "weather", "monsoon", "heatwave"],
  },
  economy: {
    query: "india economy finance news today",
    keywords: ["economy", "economic", "inflation", "gdp", "finance", "rupee"],
  },
  technology: {
    query: "india technology tech news today",
    keywords: ["technology", "tech", "ai", "startup", "digital", "software"],
  },
  education: {
    query: "india education news today",
    keywords: ["education", "school", "college", "university", "exam", "student"],
  },
  sports: {
    query: "india sports news today",
    keywords: ["sports", "cricket", "football", "match", "tournament", "athlete"],
  },
  science: {
    query: "india science research news today",
    keywords: ["science", "research", "isro", "space", "discovery", "scientist"],
  },
  health: {
    query: "india health medical news today",
    keywords: ["health", "medical", "hospital", "disease", "wellness", "doctor"],
  },
  default: {
    query: "india breaking news today",
    keywords: ["breaking", "headline", "latest", "news"],
  },
};

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function isIndianCategoryMatch(
  video: DailymotionVideo,
  categoryConfig: (typeof categoryConfigs)[string],
) {
  const searchText = [
    video.title,
    video.description,
    video["owner.screenname"],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    includesAnyKeyword(searchText, INDIA_KEYWORDS) &&
    includesAnyKeyword(searchText, categoryConfig.keywords)
  );
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.DAILYMOTION_API_KEY;
  const clientSecret = process.env.DAILYMOTION_API_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Dailymotion API credentials");
  }

  const response = await fetch("https://api.dailymotion.com/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "read",
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as { access_token?: string };

  if (!response.ok || !data.access_token) {
    throw new Error("Unable to get Dailymotion access token");
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + 50 * 60 * 1000;

  return cachedToken;
}

export async function GET(request: Request) {
  if (!isTrustedSameOriginRequest(request)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: { Vary: "Origin, Referer, Sec-Fetch-Site, Host" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedCategory = searchParams.get("category") || "top-stories";
  const parsedPage = Number(searchParams.get("page") || "1");
  const page =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.min(Math.floor(parsedPage), MAX_PAGE)
      : 1;

  try {
    const ip = getClientIp(request);
    const rateLimit = enforceRateLimit(
      `shorts_api_${ip}`,
      SHORTS_RATE_LIMIT,
      SHORTS_RATE_WINDOW_MS,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            Vary: "Origin, Referer, Sec-Fetch-Site, Host",
          },
        },
      );
    }

    const token = await getAccessToken();
    const categoryConfig =
      categoryConfigs[requestedCategory] || categoryConfigs.default;
    const dailyMotionParams = new URLSearchParams({
      fields:
        "id,title,thumbnail_url,duration,views_total,created_time,owner.screenname,owner.avatar_60_url,description",
      search: categoryConfig.query,
      channel: "news",
      sort: "recent",
      limit: "25",
      page: String(page),
      language: "en",
    });

    const response = await fetch(
      `https://api.dailymotion.com/videos?${dailyMotionParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    const data = (await response.json()) as DailymotionResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || "Dailymotion videos request failed");
    }

    const videos =
      data.list
        ?.filter(
          (video) =>
            Boolean(video.id) && isIndianCategoryMatch(video, categoryConfig),
        )
        .map((video) => ({
          id: video.id,
          title: video.title || "News short",
          description: video.description || "",
          thumbnail: video.thumbnail_url || "",
          duration: video.duration || 0,
          views: video.views_total || 0,
          source: video["owner.screenname"] || "News",
          avatar: video["owner.avatar_60_url"] || "",
          createdAt: video.created_time || 0,
          embedUrl: `https://www.dailymotion.com/embed/video/${video.id}`,
          watchUrl: `https://www.dailymotion.com/video/${video.id}`,
        }))
        .slice(0, 10) || [];

    return NextResponse.json({
      videos,
      hasMore: Boolean(data.has_more && videos.length === 10),
      page,
      total: videos.length,
    }, {
      headers: {
        "Cache-Control": "private, no-store",
        Vary: "Origin, Referer, Sec-Fetch-Site, Host",
      },
    });
  } catch (error) {
    console.error("Shorts API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch shorts" },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store",
          Vary: "Origin, Referer, Sec-Fetch-Site, Host",
        },
      },
    );
  }
}

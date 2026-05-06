import { NextResponse } from "next/server";
import {
    enforceRateLimit,
    getClientIp,
    isTrustedSameOriginRequest,
} from "@/lib/apiSecurity";

const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const DEFAULT_QUERY = "live news";
const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 12;
const MAX_QUERY_WORDS = 12;
const YOUTUBE_LIVE_RATE_LIMIT = 20;
const YOUTUBE_LIVE_RATE_WINDOW_MS = 60 * 1000;

function normalizeQuery(rawQuery: string | null) {
    return (rawQuery ?? "")
        .replace(/[^\w\s-]/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, MAX_QUERY_WORDS)
        .join(" ")
        .slice(0, MAX_QUERY_LENGTH);
}

function getApiKey() {
    const apiKey =
        process.env.YOUTUBE_API_KEY ?? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    return (apiKey ?? "").trim().replace(/^=+/, "");
}

export async function GET(request: Request) {
    if (!isTrustedSameOriginRequest(request)) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403, headers: { Vary: "Origin, Referer, Sec-Fetch-Site, Host" } },
        );
    }

    const ip = getClientIp(request);
    const rateLimit = enforceRateLimit(
        `youtube_live_api_${ip}`,
        YOUTUBE_LIVE_RATE_LIMIT,
        YOUTUBE_LIVE_RATE_WINDOW_MS,
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

    const { searchParams } = new URL(request.url);
    const normalizedQuery = normalizeQuery(searchParams.get("q"));
    const query = normalizedQuery
        ? normalizedQuery.toLowerCase().includes("news")
            ? normalizedQuery
            : `${normalizedQuery} news`
        : DEFAULT_QUERY;
    const apiKey = getApiKey();

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing YouTube API key in environment variables." },
            {
                status: 500,
                headers: { "Cache-Control": "private, no-store" },
            },
        );
    }

    const params = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        eventType: "live",
        maxResults: MAX_RESULTS.toString(),
        relevanceLanguage: "en",
        regionCode: "IN",
        videoEmbeddable: "true",
        key: apiKey,
    });

    try {
        const response = await fetch(
            `${YOUTUBE_SEARCH_ENDPOINT}?${params.toString()}`,
            {
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            },
        );

        const data = (await response.json().catch(() => null)) as
            | { items?: unknown[]; error?: { message?: string } }
            | null;

        if (!response.ok) {
            const message =
                data?.error?.message ||
                `YouTube API request failed with status ${response.status}`;
            return NextResponse.json(
                { error: message },
                {
                    status: response.status,
                    headers: {
                        "Cache-Control": "private, no-store",
                        Vary: "Origin, Referer, Sec-Fetch-Site, Host",
                    },
                },
            );
        }

        return NextResponse.json(
            { items: data?.items ?? [] },
            {
                status: 200,
                headers: {
                    "Cache-Control": "private, no-store",
                    Vary: "Origin, Referer, Sec-Fetch-Site, Host",
                },
            },
        );
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to reach YouTube.";
        return NextResponse.json(
            { error: message },
            {
                status: 502,
                headers: {
                    "Cache-Control": "private, no-store",
                    Vary: "Origin, Referer, Sec-Fetch-Site, Host",
                },
            },
        );
    }
}

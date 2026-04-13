import { NextResponse } from "next/server";

const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const DEFAULT_QUERY = "live news";
const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 12;

function normalizeQuery(rawQuery: string | null) {
    return (rawQuery ?? "").trim().slice(0, MAX_QUERY_LENGTH);
}

function getApiKey() {
    const apiKey =
        process.env.YOUTUBE_API_KEY ?? process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    return (apiKey ?? "").trim().replace(/^=+/, "");
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = normalizeQuery(searchParams.get("q")) || DEFAULT_QUERY;
    const apiKey = getApiKey();

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing YouTube API key in environment variables." },
            { status: 500 },
        );
    }

    const params = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        eventType: "live",
        maxResults: MAX_RESULTS.toString(),
        relevanceLanguage: "en",
        regionCode: "US",
        videoEmbeddable: "true",
        key: apiKey,
    });

    try {
        const response = await fetch(
            `${YOUTUBE_SEARCH_ENDPOINT}?${params.toString()}`,
            { cache: "no-store" },
        );

        const data = (await response.json().catch(() => null)) as
            | { items?: unknown[]; error?: { message?: string } }
            | null;

        if (!response.ok) {
            const message =
                data?.error?.message ||
                `YouTube API request failed with status ${response.status}`;
            return NextResponse.json({ error: message }, { status: response.status });
        }

        return NextResponse.json({ items: data?.items ?? [] }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to reach YouTube.";
        return NextResponse.json({ error: message }, { status: 502 });
    }
}

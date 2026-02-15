"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "../../../lib/superbaseClient";

interface YoutubeLiveItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
  };
}

interface YoutubeSearchResponse {
  items?: YoutubeLiveItem[];
}

const DEFAULT_QUERY = "live news";
const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

const normalizeApiKey = (rawKey: string | undefined) =>
  (rawKey ?? "").trim().replace(/^=+/, "");

const getYoutubeResultsUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export default function LiveNewsPage() {
  const [videos, setVideos] = useState<YoutubeLiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackQuery, setFallbackQuery] = useState(DEFAULT_QUERY);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_QUERY);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setIsAuthenticated(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setIsAuthenticated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchLiveNewsVideos = useCallback(async (query: string) => {
    const normalizedQuery = query.trim() || DEFAULT_QUERY;
    const apiKey = normalizeApiKey(process.env.NEXT_PUBLIC_YOUTUBE_API_KEY);

    if (!apiKey) {
      setError(
        "For a technical reason, we are currently unable to load the live stream.",
      );
      setFallbackQuery(normalizedQuery);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: normalizedQuery,
      type: "video",
      eventType: "live",
      maxResults: "12",
      relevanceLanguage: "en",
      regionCode: "US",
      videoEmbeddable: "true",
      key: apiKey,
    });

    try {
      const response = await fetch(
        `${YOUTUBE_SEARCH_ENDPOINT}?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `YouTube API request failed with status ${response.status}`,
        );
      }

      const data: YoutubeSearchResponse = await response.json();
      const nextVideos = (data.items ?? []).filter((item) =>
        Boolean(item.id?.videoId),
      );

      if (nextVideos.length === 0) {
        setError(
          "For a technical reason, we are currently unable to load the live stream.",
        );
        setFallbackQuery(normalizedQuery);
        setLoading(false);
        return;
      }

      setVideos(nextVideos);
      setError(null);
      setFallbackQuery(normalizedQuery);
      setLoading(false);
    } catch {
      setError(
        "For a technical reason, we are currently unable to load the live stream.",
      );
      setFallbackQuery(normalizedQuery);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveNewsVideos(DEFAULT_QUERY);
  }, [fetchLiveNewsVideos]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    void fetchLiveNewsVideos(searchQuery);
  };

  const handleVideoError = (videoId: string) => {
    window.location.assign(`https://www.youtube.com/watch?v=${videoId}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
            🔴LiveNews
          </h1>
          <p className="text-gray-600">Loading live streams...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900">
          🔴LiveNews
        </h1>
        <p className="mb-6 text-gray-600">
          Watch active YouTube live news streams in real time.
        </p>

        {isAuthenticated && (
          <form
            onSubmit={handleSearch}
            className="mb-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search live feeds (e.g. BBC live, India news live, Sports etc.)"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Search Live
            </button>
          </form>
        )}

        {!isAuthenticated && (
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm ring-1 ring-blue-50">
                  <span className="text-xl">🔑</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Unlock Custom Search
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
                    Sign in to search for specific live feeds. We've curated
                    some popular live news streams for you below.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <p className="mb-3">{error}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Go to Top Headlines
              </Link>
              <button
                type="button"
                onClick={() =>
                  window.location.assign(getYoutubeResultsUrl(fallbackQuery))
                }
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Redirect to YouTube
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {videos.map((video) => {
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

            return (
              <article
                key={video.id.videoId}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="aspect-video w-full bg-black">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${video.id.videoId}?rel=0`}
                    title={video.snippet.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={() => handleVideoError(video.id.videoId)}
                  />
                </div>

                <div className="space-y-3 p-4">
                  <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                    {video.snippet.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {video.snippet.channelTitle}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(videoUrl, "_blank", "noopener,noreferrer")
                    }
                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    ▶ Play on YouTube
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

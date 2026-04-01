"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  Loader2,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  EXPLORE_REGIONS,
  type ExploreArticle,
  type ExploreResponse,
  type ExploreRegionId,
} from "@/lib/explore";
import { getNewsImageSrc } from "@/lib/newsImage";
import {
  getUserPersonalization,
  saveUserPersonalization,
} from "../services/personalizationService";

type ExploreState = {
  data: ExploreResponse | null;
  loading: boolean;
  error: string | null;
};

const EMPTY_STATE: ExploreState = {
  data: null,
  loading: true,
  error: null,
};

function formatRelativeTime(timestamp: string) {
  const value = Date.parse(timestamp);
  if (Number.isNaN(value)) return "Recently";

  const diffMs = Date.now() - value;
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function StoryImage({
  article,
  className,
}: {
  article: ExploreArticle;
  className?: string;
}) {
  return (
    <img
      src={getNewsImageSrc(article.urlToImage)}
      alt={article.title}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = "/news1.jpg";
      }}
      className={className}
    />
  );
}

function PageSurface({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/80 bg-white/92 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

export default function ExplorePage() {
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<ExploreRegionId>("world");
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [exploreState, setExploreState] = useState<ExploreState>(EMPTY_STATE);
  const [followedSources, setFollowedSources] = useState<string[]>([]);
  const [favoriteTopics, setFavoriteTopics] = useState<string[]>([]);
  const [isSavingSources, setIsSavingSources] = useState<string | null>(null);

  useEffect(() => {
    const syncAuthState = () => {
      const authToken = localStorage.getItem("auth_token")?.trim();
      const authEmail = localStorage.getItem("auth_email")?.trim();
      setIsAuthenticated(Boolean(authToken || authEmail));
      setIsAuthResolved(true);
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setExploreState({ data: null, loading: false, error: null });
      setFollowedSources([]);
      setFavoriteTopics([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    const loadPersonalization = async () => {
      try {
        const { data } = await getUserPersonalization();
        if (ignore) return;
        setFollowedSources(
          Array.isArray(data?.favorite_sources) ? data.favorite_sources : [],
        );
        setFavoriteTopics(
          Array.isArray(data?.favorite_topics) ? data.favorite_topics : [],
        );
      } catch {
        if (ignore) return;
        setFollowedSources([]);
        setFavoriteTopics([]);
      }
    };

    void loadPersonalization();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    const fetchExplore = async () => {
      setExploreState((current) => ({
        data: current.data,
        loading: true,
        error: null,
      }));

      try {
        const params = new URLSearchParams({ region: selectedRegion });
        if (appliedQuery.trim()) params.set("q", appliedQuery.trim());

        const response = await fetch(`/api/explore?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as ExploreResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Could not load explore feed.");
        }

        if (ignore) return;
        setExploreState({ data: payload, loading: false, error: null });
      } catch (error) {
        if (ignore) return;
        setExploreState({
          data: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not load explore feed.",
        });
      }
    };

    void fetchExplore();
    return () => {
      ignore = true;
    };
  }, [appliedQuery, isAuthenticated, selectedRegion]);

  const data = exploreState.data;
  const heroArticle = data?.heroArticle ?? null;
  const sideArticles = data?.sideArticles ?? [];
  const visibleCategories = data?.moreStoryCategories ?? [];
  const visibleTrendingTopics = data?.trendingTopics ?? [];
  const visibleSources = data?.sourceSuggestions ?? [];

  const followSet = useMemo(() => new Set(followedSources), [followedSources]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedQuery(searchInput.trim());
  };

  const handleHeroPromptSearch = () => {
    const prompt = data?.heroSearchPrompt?.trim();
    if (!prompt) return;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(prompt)}`;
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleSource = async (sourceName: string) => {
    const nextSources = followSet.has(sourceName)
      ? followedSources.filter((item) => item !== sourceName)
      : [...followedSources, sourceName];

    setFollowedSources(nextSources);
    setIsSavingSources(sourceName);

    try {
      await saveUserPersonalization({
        favoriteSources: nextSources,
        favoriteTopics,
      });
    } catch {
      setFollowedSources(followedSources);
    } finally {
      setIsSavingSources(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {!isAuthResolved ? (
          <PageSurface className="p-8">
            <div className="flex items-center gap-3 text-[var(--muted)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm font-medium">Checking your session...</p>
            </div>
          </PageSurface>
        ) : !isAuthenticated ? (
          <PageSurface className="overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/80 px-8 py-6 dark:border-slate-700/80 dark:bg-slate-800/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Login Required
              </p>
            </div>
            <div className="mx-auto flex max-w-2xl flex-col items-center px-8 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Explore opens after sign in
              </h1>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                This area uses saved session data and personalization, so we only
                show it for logged-in users.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Login / Register
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </PageSurface>
        ) : (
          <>
            <PageSurface className="overflow-hidden">
              <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-6 dark:border-slate-700/80 dark:bg-slate-800/60 sm:px-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[color:color-mix(in_srgb,var(--primary)_10%,white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_16%,transparent)]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Live Explore
                    </div>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-[2.8rem]">
                      Explore
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                      Switch regions or search a live topic. Stories, category
                      paths, trends, and suggested sources all update around what
                      is happening now.
                    </p>
                  </div>

                  <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
                    <div className="relative rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                      <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
                        aria-hidden
                      />
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search regions, topics..."
                        className="w-full bg-transparent py-4 pl-12 pr-28 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] sm:text-base"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="px-6 py-4 sm:px-8">
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {EXPLORE_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => setSelectedRegion(region.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        selectedRegion === region.id
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                          : "border-slate-200 bg-white text-[var(--foreground)] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                      }`}
                    >
                      <span
                        className={
                          selectedRegion === region.id
                            ? "text-[var(--background)]"
                            : "text-[var(--primary)]"
                        }
                      >
                        {region.id === "world" ? (
                          <Globe2 className="h-4 w-4" />
                        ) : (
                          <Compass className="h-4 w-4" />
                        )}
                      </span>
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>
            </PageSurface>

            {exploreState.loading ? (
              <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
                <PageSurface className="h-[30rem] animate-pulse bg-slate-100/80 dark:bg-slate-800/70" />
                <div className="grid gap-4">
                  <PageSurface className="h-[14.5rem] animate-pulse bg-slate-100/80 dark:bg-slate-800/70" />
                  <PageSurface className="h-[14.5rem] animate-pulse bg-slate-100/80 dark:bg-slate-800/70" />
                </div>
              </div>
            ) : exploreState.error ? (
              <PageSurface className="p-8">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-300">
                  <TrendingUp className="h-5 w-5" />
                  <p className="text-sm font-medium">{exploreState.error}</p>
                </div>
              </PageSurface>
            ) : (
              <>
                <section className="space-y-4">
                  <SectionHeading
                    eyebrow="Editorial Hero Grid"
                    title={`${data?.regionLabel} now`}
                    description={
                      data?.regionBrief ||
                      "The strongest story sits on the left, with two supporting developments stacked on the right."
                    }
                  />

                  <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
                    {heroArticle ? (
                      <PageSurface className="overflow-hidden">
                        <div className="relative h-72 sm:h-80">
                          <StoryImage
                            article={heroArticle}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
                          <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
                              {data?.regionLabel}
                            </span>
                            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
                              {formatRelativeTime(heroArticle.publishedAt)}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <p className="text-sm font-medium text-white/80">
                              {heroArticle.source.name}
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                              {heroArticle.title}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-5 p-6 sm:p-7">
                          <p className="text-base leading-7 text-[var(--muted)]">
                            {heroArticle.description ||
                              "Open the lead story first, then use the guided direction below to search a related angle inside this region."}
                          </p>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                              Suggested Search Direction
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                              {data?.heroSearchPrompt}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={handleHeroPromptSearch}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                            >
                              Search this angle
                              <Search className="h-4 w-4" />
                            </button>
                            <a
                              href={heroArticle.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                            >
                              Open full story
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </PageSurface>
                    ) : null}

                    <div className="grid gap-4">
                      {sideArticles.map((article) => (
                        <PageSurface key={article.url} className="overflow-hidden">
                          <div className="grid sm:grid-cols-[11rem_1fr] lg:grid-cols-1">
                            <div className="relative h-44 sm:h-full lg:h-40">
                              <StoryImage
                                article={article}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                            </div>
                            <div className="p-5">
                              <span className="inline-flex rounded-full bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] px-3 py-1 text-xs font-medium text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                {article.source.name}
                              </span>
                              <h3 className="mt-4 text-xl font-semibold leading-snug text-[var(--foreground)]">
                                {article.title}
                              </h3>
                              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                                {article.description ||
                                  "A secondary development that adds more context to the main regional picture."}
                              </p>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
                              >
                                Read story
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </PageSurface>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <SectionHeading
                    eyebrow="More Stories"
                    title="Category paths shaped by the region"
                    description="These category cards stay simple and editorial, giving users a cleaner way to jump into the most relevant topic streams."
                  />

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {visibleCategories.map((category) => (
                      <Link key={category.slug} href={`/categories/${category.slug}`}>
                        <PageSurface className="h-full p-6 transition hover:border-slate-300 hover:shadow-md dark:hover:border-slate-600">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
                            <Compass className="h-5 w-5" />
                          </div>
                          <h3 className="mt-5 text-2xl font-semibold text-[var(--foreground)]">
                            {category.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                            {category.description}
                          </p>
                          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                            Open category
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </PageSurface>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-[0.9fr_1.4fr]">
                  <PageSurface className="p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-200">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                          Trending In Region
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                          Live pulse
                        </h2>
                      </div>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
                      AI + News API signal mix
                    </div>

                    <div className="mt-6 space-y-3">
                      {visibleTrendingTopics.map((topic, index) => (
                        <div
                          key={`${topic.tag}-${index}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/70"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-semibold text-[var(--foreground)]">
                                {topic.tag}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                {topic.reason}
                              </p>
                            </div>
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PageSurface>

                  <PageSurface className="p-6 sm:p-7">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                          Sources To Follow
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                          Suggested voices for this region
                        </h2>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-[var(--muted)] dark:border-slate-700 dark:bg-slate-800/70">
                        Saved to personalization
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {visibleSources.map((source, index) => {
                        const isFollowing = followSet.has(source.name);
                        const isSaving = isSavingSources === source.name;

                        return (
                          <div
                            key={`${source.name}-${source.regionHint}-${index}`}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] text-sm font-semibold text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]">
                                {source.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-[var(--foreground)]">
                                  {source.name}
                                </p>
                                <p className="text-sm text-[var(--muted)]">
                                  {source.regionHint}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                                  {source.reason}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => void handleToggleSource(source.name)}
                              disabled={isSaving}
                              className={`inline-flex min-w-[110px] shrink-0 items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                                isFollowing
                                  ? "border-[color:color-mix(in_srgb,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_12%,white)] text-[var(--primary)] dark:bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)]"
                                  : "border-slate-200 bg-white text-[var(--foreground)] hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                              }`}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isFollowing ? (
                                "Following"
                              ) : (
                                "Follow"
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </PageSurface>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

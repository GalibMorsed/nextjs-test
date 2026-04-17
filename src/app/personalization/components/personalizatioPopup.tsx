"use client";

import { useEffect, useState } from "react";
import { Sparkles, WandSparkles, X } from "lucide-react";
import { AVAILABLE_PERSONALIZATION_TOPICS } from "@/lib/personalizationTopics";

export const PERSONALIZATION_PROMO_DISMISS_KEY =
  "personalization_promo_ad_dismissed";
export const PERSONALIZATION_PROMO_HIDE_EVENT =
  "personalization-promo-hide";

type PersonalizationPromoAdProps = {
  favoriteSourcesCount: number;
  favoriteTopicsCount: number;
};

export default function PersonalizationPromoAd({
  favoriteSourcesCount,
  favoriteTopicsCount,
}: PersonalizationPromoAdProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem(PERSONALIZATION_PROMO_DISMISS_KEY) !== "true"
    );
  });

  const dismissPromo = () => {
    localStorage.setItem(PERSONALIZATION_PROMO_DISMISS_KEY, "true");
    setIsVisible(false);
  };

  useEffect(() => {
    const hidePromo = () => {
      localStorage.setItem(PERSONALIZATION_PROMO_DISMISS_KEY, "true");
      setIsVisible(false);
    };
    window.addEventListener(PERSONALIZATION_PROMO_HIDE_EVENT, hidePromo);
    return () => {
      window.removeEventListener(PERSONALIZATION_PROMO_HIDE_EVENT, hidePromo);
    };
  }, []);

  const scrollToAiSuggestions = () => {
    const target =
      document.getElementById("ai-topic-suggestions-button") ||
      document.getElementById("ai-topic-suggestions");

    target?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  if (!isVisible) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-sky-200/90 bg-sky-50/95 px-4 py-4 shadow-xl shadow-sky-500/10 backdrop-blur-sm dark:border-sky-900/70 dark:bg-sky-950/40 dark:shadow-black/30 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/15 dark:bg-[var(--primary)]/15">
          <Sparkles size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
            Make your news feed personal
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sky-800/90 dark:text-sky-200/90">
            Choose from {AVAILABLE_PERSONALIZATION_TOPICS.length}+ app topics,
            use AI suggestions, and save the mix that shapes your home feed.
          </p>

          <div className="mt-3 space-y-1.5 text-[11px] font-medium text-sky-800/90 dark:text-sky-200/90">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              <span>AI finds timely topics beyond the default list</span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToAiSuggestions}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-[var(--primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
          >
            <WandSparkles size={14} />
            Try AI suggestions
          </button>
        </div>

        <button
          type="button"
          onClick={dismissPromo}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-100 hover:text-sky-900 dark:text-sky-300 dark:hover:bg-sky-900/50 dark:hover:text-sky-100"
          aria-label="Dismiss personalization promo"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}

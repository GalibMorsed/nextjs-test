"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "../../../lib/superbaseClient";
import { incrementAiSummaryUsage } from "@/lib/activityAnalytics";
import { useAILimit } from "@/hooks/useAILimit";
import Link from "next/link";

interface AISummaryButtonProps {
  title: string;
  description: string | null;
  content: string | null;
  sourceName?: string;
  category?: string;
  showPromo?: boolean;
}

const AI_SUMMARY_PROMO_DISMISS_KEY = "ai_summary_promo_dismissed";

function toBulletPoints(rawSummary: string) {
  const normalized = rawSummary.trim();
  if (!normalized) return [];

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines
      .map((line) => line.replace(/^(\d+[\).\s-]+|[-*\u2022]+\s*)/, "").trim())
      .filter(Boolean);
  }

  return normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function AISummaryButton({
  title,
  description,
  content,
  sourceName,
  category,
  showPromo = false,
}: AISummaryButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [showSummaryPromo, setShowSummaryPromo] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AI_SUMMARY_PROMO_DISMISS_KEY) !== "true";
  });
  const [promoStyle, setPromoStyle] = useState<
    { left: number; top: number } | undefined
  >();
  const [promoPlacement, setPromoPlacement] = useState<"above" | "below">(
    "below",
  );
  const [promoArrowLeft, setPromoArrowLeft] = useState(0);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const promoRef = useRef<HTMLDivElement | null>(null);
  const summaryPoints = toBulletPoints(summary);
  const { isLocked, limit } = useAILimit();
  const shouldShowPlansCTA =
    isLocked || error.toLowerCase().includes("free limit");

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Use cached local token — no Supabase call needed
        if (
          localStorage.getItem("auth_token") ||
          localStorage.getItem("auth_email")
        ) {
          if (isMounted) setIsLoggedIn(true);
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (isMounted) setIsLoggedIn(Boolean(data.session?.user));
      } catch {
        // silently ignore AbortError / navigator-lock timeout
      }
    };

    void checkAuth();

    const handleStorageOrFocus = () => {
      const hasLocal =
        Boolean(localStorage.getItem("auth_token")) ||
        Boolean(localStorage.getItem("auth_email"));
      if (isMounted) setIsLoggedIn(hasLocal);
    };

    window.addEventListener("storage", handleStorageOrFocus);
    window.addEventListener("focus", handleStorageOrFocus);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageOrFocus);
      window.removeEventListener("focus", handleStorageOrFocus);
      subscription.unsubscribe();
    };
  }, []);

  useLayoutEffect(() => {
    if (!showPromo || !showSummaryPromo) return undefined;

    const updatePromoPosition = () => {
      const anchor = anchorRef.current;
      const promo = promoRef.current;
      if (!anchor || !promo) return;

      const anchorRect = anchor.getBoundingClientRect();
      const promoRect = promo.getBoundingClientRect();
      const viewportPadding = 12;
      const spacing = 12;

      const prefersAbove = window.innerWidth >= 768;
      let placement: "above" | "below" = prefersAbove ? "above" : "below";

      let top =
        placement === "above"
          ? anchorRect.top - promoRect.height - spacing
          : anchorRect.bottom + spacing;

      if (placement === "above" && top < viewportPadding) {
        placement = "below";
        top = anchorRect.bottom + spacing;
      }

      if (
        placement === "below" &&
        top + promoRect.height > window.innerHeight - viewportPadding
      ) {
        placement = "above";
        top = anchorRect.top - promoRect.height - spacing;
      }

      const centeredLeft =
        anchorRect.left + anchorRect.width / 2 - promoRect.width / 2;
      const minLeft = viewportPadding;
      const maxLeft = window.innerWidth - promoRect.width - viewportPadding;
      const left = Math.min(Math.max(centeredLeft, minLeft), maxLeft);
      const anchorCenter = anchorRect.left + anchorRect.width / 2;
      const minArrowLeft = 28;
      const maxArrowLeft = promoRect.width - 28;
      const arrowLeft = Math.min(
        Math.max(anchorCenter - left, minArrowLeft),
        maxArrowLeft,
      );

      setPromoPlacement(placement);
      setPromoStyle({ left, top });
      setPromoArrowLeft(arrowLeft);
    };

    const raf = window.requestAnimationFrame(updatePromoPosition);
    window.addEventListener("resize", updatePromoPosition);
    window.addEventListener("scroll", updatePromoPosition, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePromoPosition);
      window.removeEventListener("scroll", updatePromoPosition, true);
    };
  }, [showPromo, showSummaryPromo]);

  if (!isLoggedIn) {
    return null;
  }

  const dismissSummaryPromo = () => {
    localStorage.setItem(AI_SUMMARY_PROMO_DISMISS_KEY, "true");
    setShowSummaryPromo(false);
  };

  const openSummary = async () => {
    dismissSummaryPromo();
    setIsOpen(true);
    setError("");

    if (isLocked) {
      setError(`You've reached your free limit of ${limit} AI usages. Activate any plan to unlock.`);
      return;
    }

    if (summary || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Use the locally cached token — avoids another Supabase lock call
      const accessToken = localStorage.getItem("auth_token");
      if (!accessToken) {
        throw new Error("Please log in again to use AI summaries.");
      }

      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          content,
          source: sourceName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Unable to create summary.",
        );
      }

      setSummary(typeof data?.summary === "string" ? data.summary : "");
      incrementAiSummaryUsage({
        source: sourceName,
        category,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create summary.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div ref={anchorRef} className="relative inline-flex">
        <AnimatePresence>
          {showPromo && showSummaryPromo && (
            <motion.div
              ref={promoRef}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={promoStyle}
              className="fixed z-20 w-64 max-w-[85vw] rounded-2xl border border-sky-200/90 bg-sky-50/95 p-3 pr-8 text-left shadow-xl shadow-sky-500/10 backdrop-blur-sm dark:border-sky-900/70 dark:bg-sky-950/90 sm:max-w-[70vw]"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                  <Bot size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-sky-950 dark:text-sky-100">
                    Use AI Summary
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-sky-800/90 dark:text-sky-200/90">
                    Get the key points faster for a better reading experience.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissSummaryPromo}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-sky-700 transition hover:bg-sky-100 hover:text-sky-900 dark:text-sky-300 dark:hover:bg-sky-900/60 dark:hover:text-sky-100"
                aria-label="Dismiss AI summary tip"
              >
                <X size={14} />
              </button>
              <span
                className={`absolute h-3.5 w-3.5 bg-sky-50 dark:bg-sky-950 ${
                  promoPlacement === "above"
                    ? "-bottom-2 border-b border-r border-sky-200/90 dark:border-sky-900/70"
                    : "-top-2 border-l border-t border-sky-200/90 dark:border-sky-900/70"
                }`}
                style={{
                  left: promoArrowLeft,
                  transform: "translateX(-50%) rotate(45deg)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={openSummary}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-all duration-300 hover:scale-[1.05] hover:shadow-lg hover:shadow-blue-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          aria-label="AI summary"
          title="AI summary"
        >
          {/* Shimmer sweep effect */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

          <Sparkles
            size={18}
            className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-md p-0 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:max-w-3xl sm:rounded-2xl sm:p-6 dark:border-slate-700 dark:bg-slate-900"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-summary-title"
            >
              <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-500/15">
                    <Bot
                      size={18}
                      className="text-blue-600 dark:text-blue-300"
                    />
                  </div>
                  <div>
                    <h3
                      id="ai-summary-title"
                      className="text-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                      AI Summary
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Article summary generated by AI.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-offset-slate-900"
                  aria-label="Close summary"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mb-4 text-sm font-medium leading-relaxed text-slate-700 sm:text-base dark:text-slate-200">
                {title}
              </p>

              <div className="max-h-[62vh] overflow-y-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-5 dark:border-slate-700 dark:from-slate-950 dark:to-slate-900">
                {isLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Loader2 size={16} className="animate-spin" />
                    Generating summary...
                  </div>
                ) : error ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/40">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    {shouldShowPlansCTA && (
                      <Link
                        href="/plans"
                        className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700"
                        onClick={() => setIsOpen(false)}
                      >
                        Go to Plans
                      </Link>
                    )}
                  </div>
                ) : summaryPoints.length > 0 ? (
                  <ul className="space-y-3">
                    {summaryPoints.map((point, index) => (
                      <li
                        key={`${point.slice(0, 24)}-${index}`}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
                        <p className="text-sm leading-7 text-slate-800 sm:text-[15px] dark:text-slate-200">
                          {point}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    No summary was generated for this article.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

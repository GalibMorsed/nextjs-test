"use client";

import Link from "next/link";
import { motion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import LottiePlayer from "./LottiePlayer";
import {
  GOAL_TRACKER_EVENT,
  readGoalTrackerState,
  syncGoalTrackerProgress,
} from "@/lib/activityAnalytics";

const BANNER_DISMISSED_AT_KEY = "goal-tracker-banner-dismissed-at";
const BANNER_DISMISSED_COMPLETED_AT_KEY =
  "goal-tracker-banner-dismissed-completed-at";
const DISMISS_MS = 10 * 60 * 1000;

const softSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 22,
};

const getIsoWeekKey = (date: Date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const readNumber = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clearDismissedState = () => {
  localStorage.removeItem(BANNER_DISMISSED_AT_KEY);
  localStorage.removeItem(BANNER_DISMISSED_COMPLETED_AT_KEY);
};

export default function GoalCompletionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function scheduleRefresh(delayMs: number) {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (delayMs <= 0) return;
      timeoutRef.current = window.setTimeout(() => {
        void refresh();
      }, delayMs);
    }

    async function refresh() {
      await syncGoalTrackerProgress();
      const state = await readGoalTrackerState();
      if (!state?.lastStreakUpdate) {
        setIsVisible(false);
        return;
      }
      const currentWeekKey = getIsoWeekKey(new Date());
      const isComplete = state.lastStreakUpdate === currentWeekKey;
      if (!isComplete) {
        setIsVisible(false);
        return;
      }

      const completedAt = state.lastGoalCompletedAt ?? 0;
      const goalUpdatedAt = state.lastGoalUpdatedAt ?? 0;
      const hasNewGoalAfterCompletion =
        completedAt > 0 && goalUpdatedAt > completedAt;

      if (hasNewGoalAfterCompletion) {
        clearDismissedState();
        setIsVisible(false);
        return;
      }

      const dismissedCompletedAt = readNumber(
        localStorage.getItem(BANNER_DISMISSED_COMPLETED_AT_KEY),
      );

      if (
        dismissedCompletedAt > 0 &&
        completedAt > 0 &&
        dismissedCompletedAt !== completedAt
      ) {
        clearDismissedState();
      }

      const activeDismissedAt = readNumber(
        localStorage.getItem(BANNER_DISMISSED_AT_KEY),
      );
      const activeDismissedCompletedAt = readNumber(
        localStorage.getItem(BANNER_DISMISSED_COMPLETED_AT_KEY),
      );
      const remainingDismissMs =
        activeDismissedAt > 0
          ? DISMISS_MS - (Date.now() - activeDismissedAt)
          : 0;
      const isSuppressed =
        activeDismissedAt > 0 &&
        activeDismissedCompletedAt === completedAt &&
        remainingDismissMs > 0;

      setIsVisible(!isSuppressed);

      if (isSuppressed) {
        scheduleRefresh(remainingDismissMs + 50);
      }
    }

    const handleRefresh = () => {
      void refresh();
    };

    void refresh();
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(GOAL_TRACKER_EVENT, handleRefresh);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(GOAL_TRACKER_EVENT, handleRefresh);
    };
  }, []);

  const handleDismiss = async () => {
    const state = await readGoalTrackerState();
    const completedAt = state?.lastGoalCompletedAt ?? 0;
    localStorage.setItem(BANNER_DISMISSED_AT_KEY, String(Date.now()));
    localStorage.setItem(
      BANNER_DISMISSED_COMPLETED_AT_KEY,
      String(completedAt),
    );
    setIsVisible(false);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || info.offset.y < -60) {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={softSpring}
      className="fixed inset-x-0 top-[88px] z-30 flex justify-center px-4 sm:top-[96px]"
    >
      <div className="w-full max-w-sm">
        <motion.div
          drag
          dragElastic={0.2}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2.5 text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/90 dark:text-slate-100 dark:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)]"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100/50 ring-1 ring-amber-200/60 dark:bg-amber-400/20 dark:ring-amber-300/40"
            aria-hidden="true"
          >
            <LottiePlayer
              src="/actiivity/Star%20Strike%20Emoji.json"
              className="h-10 w-10"
              loop={true}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Weekly goal complete!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Start again - set a new weekly goal.
            </p>
          </div>
          <Link
            href="/my-activity#weekly-goal-target"
            onClick={(e) => {
              if (window.location.pathname === "/my-activity") {
                const el = document.getElementById("weekly-goal-target");
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            className="shrink-0 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition hover:bg-emerald-100/80 hover:text-emerald-700 dark:border-emerald-200/40 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:border-emerald-200/70 dark:hover:bg-emerald-400/20"
          >
            Set new goal
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

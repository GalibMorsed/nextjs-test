"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import LottiePlayer from "./LottiePlayer";

type CreditAlertBannerProps = {
  limit?: number;
  isPlan?: boolean;
  className?: string;
  nextAvailableAt?: string | null;
  isFreePlanCooldown?: boolean;
};

function useCountdown(nextAvailableAt: string | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!nextAvailableAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = new Date(nextAvailableAt).getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextAvailableAt]);

  return timeLeft;
}

export default function CreditAlertBanner({
  limit = 20,
  isPlan = false,
  className = "",
  nextAvailableAt = null,
  isFreePlanCooldown = false,
}: CreditAlertBannerProps) {
  const countdown = useCountdown(nextAvailableAt);

  return (
    <div
      className={clsx(
        "w-full rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 animate-pulse" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-sm dark:from-amber-500/10 dark:to-orange-500/10 dark:text-amber-200 dark:ring-1 dark:ring-amber-500/20">
            {isFreePlanCooldown && countdown ? (
              <LottiePlayer
                src="/actiivity/Timer clock animation.json"
                className="h-9 w-9 dark:invert dark:brightness-125"
              />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center text-center max-w-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg tracking-tight">
            {isFreePlanCooldown && countdown
              ? "Limited Access - Cooldown Active"
              : "Credit Limit Reached"}
          </h4>
          <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            {isFreePlanCooldown && countdown ? (
              <div className="flex flex-col items-center gap-1">
                <span>
                  You've reached your free credit limit of{" "}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {limit}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="opacity-80">Available again in:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m
                  </span>
                </span>
                <span className="mt-1.5 text-xs opacity-75">
                  Upgrade now to get immediate access.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span>
                  You reached your {isPlan ? "plan" : "free"} credit limit of{" "}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {limit.toLocaleString()}
                  </span>
                </span>
                <span className="opacity-80">
                  {isPlan
                    ? "Upgrade or top up to continue using AI features."
                    : "Upgrade your plan to unlock more AI insights."}
                </span>
              </div>
            )}
          </div>
          <Link
            href="/plans"
            className="group mt-5 relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] dark:bg-white dark:text-slate-900"
          >
            <span className="relative z-10">
              {isFreePlanCooldown ? "Upgrade Now" : "Upgrade Plan"}
            </span>
            <Sparkles className="relative z-10 h-3.5 w-3.5" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}

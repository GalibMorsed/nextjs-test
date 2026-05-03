"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

type CreditAlertBannerProps = {
  limit?: number;
  isPlan?: boolean;
  className?: string;
};

export default function CreditAlertBanner({
  limit = 20,
  isPlan = false,
  className = "",
}: CreditAlertBannerProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 ${className}`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-[var(--foreground)] sm:text-base">
            Credit Alert: you reached your {isPlan ? "plan" : "free"} credit limit of {limit.toLocaleString()}.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {isPlan 
              ? "Your plan's API credits are exhausted. Upgrade or top up to continue using AI features."
              : "Your free AI limit is exhausted. Upgrade your plan to unlock more AI insights."}
          </p>
          <Link
            href="/plans"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-md shadow-[var(--primary)]/20 transition-all hover:brightness-110"
          >
            Buy a Plan
          </Link>
        </div>
      </div>
    </div>
  );
}

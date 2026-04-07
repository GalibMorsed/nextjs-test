"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export const softSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 24,
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  delta,
  suffix,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  delta?: number;
  suffix?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.article
      variants={fadeUp}
      transition={softSpring}
      whileHover={{ y: -4, transition: softSpring }}
      className="rounded-[26px] border border-stone-200/70 bg-stone-50/90 p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-[0_18px_44px_-30px_rgba(16,185,129,0.2)] sm:rounded-[28px] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.22em]">
            {title}
          </p>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:mt-4 sm:text-5xl">
            {value}
            {suffix ? (
              <span className="ml-1.5 text-xl font-medium text-slate-600 dark:text-slate-300 sm:ml-2 sm:text-2xl">
                {suffix}
              </span>
            ) : null}
          </div>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary)] ring-1 ring-stone-200 dark:bg-slate-800 dark:ring-slate-700 sm:h-11 sm:w-11">
          {icon}
        </span>
      </div>
      {typeof delta === "number" ? (
        <div
          className={`mt-3 inline-flex items-start gap-1.5 text-xs leading-5 sm:mt-4 sm:items-center sm:gap-2 sm:text-sm ${positive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
        >
          {positive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {Math.abs(delta)}% vs last period
        </div>
      ) : null}
      <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400 sm:text-sm">
        {subtitle}
      </p>
    </motion.article>
  );
}

export function Panel({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      transition={softSpring}
      whileHover={{ y: -2, transition: softSpring }}
      className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6 dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-[0_18px_52px_-34px_rgba(16,185,129,0.18)]"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        {icon ? (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {icon}
          </span>
        ) : null}
      </div>
      {children}
    </motion.section>
  );
}

export function SummaryRow({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={softSpring}
      whileHover={{ x: 3, transition: softSpring }}
      className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 dark:border-slate-700/80 dark:bg-slate-950/40"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm dark:bg-slate-800">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{detail}</p>
      </div>
    </motion.div>
  );
}

export function EmptyStateText({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="rounded-[24px] border border-slate-200/80 bg-white px-4 py-5 text-sm leading-6 text-slate-500 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-400"
    >
      {children}
    </motion.div>
  );
}

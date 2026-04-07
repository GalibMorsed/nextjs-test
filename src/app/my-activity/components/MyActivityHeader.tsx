"use client";

import { motion } from "framer-motion";
import { fadeUp, softSpring } from "./MyActivityUi";

type RangeOption<TLabel extends string> = { label: TLabel };

interface MyActivityHeaderProps<TLabel extends string> {
  selectedRange: TLabel;
  rangeOptions: readonly RangeOption<TLabel>[];
  onRangeChange: (label: TLabel) => void;
  pageError?: string | null;
}

export default function MyActivityHeader<TLabel extends string>({
  selectedRange,
  rangeOptions,
  onRangeChange,
  pageError,
}: MyActivityHeaderProps<TLabel>) {
  return (
    <motion.section
      variants={fadeUp}
      transition={softSpring}
      className="rounded-[32px] border border-stone-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-7 dark:border-slate-700/80 dark:bg-slate-900/88 dark:shadow-[0_18px_60px_-28px_rgba(16,185,129,0.28)]"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
            My Activity
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
            Your reading insights, notes, history, and AI analyst activity in
            one place.{"\u{1F9D0}"}
          </p>
          <div className="mt-3 inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Selected filter: {selectedRange}
          </div>
          {pageError ? (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
              {pageError}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rangeOptions.map(({ label }) => (
            <motion.button
              key={label}
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={softSpring}
              onClick={() => onRangeChange(label)}
              className={`rounded-2xl border px-5 py-3 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300 ${
                selectedRange === label
                  ? "border-[var(--primary)] bg-stone-100 text-[var(--primary)] dark:border-emerald-500/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-stone-200 bg-stone-50 text-slate-700 hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

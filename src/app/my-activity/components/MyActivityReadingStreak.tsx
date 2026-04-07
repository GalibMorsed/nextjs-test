"use client";

import { motion } from "framer-motion";
import { Panel, softSpring } from "./MyActivityUi";

type HeatmapDay = {
  key: string;
  count: number;
};

interface MyActivityReadingStreakProps {
  heatmap: HeatmapDay[];
}

const heatColor = (count: number) =>
  count >= 6
    ? "bg-emerald-700 dark:bg-emerald-500"
    : count >= 3
      ? "bg-emerald-500 dark:bg-emerald-400"
      : count >= 1
        ? "bg-emerald-200 dark:bg-emerald-800/70"
        : "bg-slate-100 dark:bg-slate-800";

const HEAT_LEGEND = [
  { label: "None", color: "bg-stone-100 dark:bg-slate-200" },
  { label: "1-2 activities", color: "bg-emerald-200 dark:bg-emerald-300" },
  { label: "3-5 activities", color: "bg-emerald-500 dark:bg-emerald-400" },
  { label: "6+ activities", color: "bg-emerald-700 dark:bg-emerald-500" },
] as const;

export default function MyActivityReadingStreak({
  heatmap,
}: MyActivityReadingStreakProps) {
  return (
    <Panel
      title="Reading streak"
      description="A heatmap-style streak grid for recent reading activity days."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 sm:gap-3 lg:grid-cols-10">
          {heatmap.map((day, index) => (
            <motion.div
              key={day.key}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...softSpring, delay: index * 0.01 }}
              whileHover={{ scale: 1.08, y: -1 }}
              className={`flex aspect-square min-w-0 items-center justify-center rounded-lg text-[10px] font-medium sm:rounded-xl sm:text-[11px] ${heatColor(day.count)} ${
                day.count > 0
                  ? "text-emerald-950 dark:text-emerald-50"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              title={`${day.key}: ${day.count}`}
            >
              {day.key.slice(-2)}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-stone-200/80 bg-stone-50/90 px-3 py-3 text-xs sm:gap-x-7 sm:px-4 sm:text-sm dark:border-slate-700/70 dark:bg-slate-950/60">
          {HEAT_LEGEND.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs font-medium text-stone-600 sm:gap-2.5 sm:text-sm dark:text-slate-200"
            >
              <span
                className={`h-4 w-4 rounded-[4px] ring-1 ring-black/5 dark:ring-white/10 ${item.color}`}
                aria-hidden
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

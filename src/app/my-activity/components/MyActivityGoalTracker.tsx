"use client";

import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import { Panel, softSpring } from "./MyActivityUi";
import LottiePlayer from "../../components/LottiePlayer";

interface MyActivityGoalTrackerProps {
  currentWeekProgress: number;
  weeklyGoal: number;
  weeklyStreak: number;
  onSetWeeklyGoal: (value: number) => void;
  weekArticles: number;
  weekNotes: number;
  weekAi: number;
  readingStreak: number;
}

export default function MyActivityGoalTracker({
  currentWeekProgress,
  weeklyGoal,
  weeklyStreak,
  onSetWeeklyGoal,
  weekArticles,
  weekNotes,
  weekAi,
  readingStreak,
}: MyActivityGoalTrackerProps) {
  const targetOptions = [3, 5, 8, 10];
  const isGoalComplete = currentWeekProgress >= weeklyGoal;

  return (
    <Panel
      title="Goal tracker"
      description="Weekly reading goal — resets every Monday"
      icon={<Target className="h-5 w-5" />}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {currentWeekProgress}
          </span>
          <span className="text-lg font-medium text-slate-400 dark:text-slate-500">
            / {weeklyGoal} activities
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={softSpring}
          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {weeklyStreak}-week streak
        </motion.div>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(100, (currentWeekProgress / weeklyGoal) * 100)}%`,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 12 }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 shadow-[0_0_16px_-4px_rgba(16,185,129,0.5)]"
        />
        {isGoalComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 text-sm mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-medium text-slate-600 dark:text-slate-300">
          {isGoalComplete ? (
            <span className="inline-flex items-start gap-3 sm:items-center">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:ring-emerald-800/50"
                aria-hidden="true"
              >
                <LottiePlayer
                  src="/actiivity/congrats.json"
                  className="h-10 w-10"
                  loop={true}
                />
              </span>
              <span className="leading-6">
                Goal reached! Amazing work this week.
              </span>
            </span>
          ) : (
            <>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {weeklyGoal - currentWeekProgress} more
              </span>{" "}
              to hit your weekly goal
            </>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 sm:text-right">
          Resets Mon
        </p>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          This week&apos;s contributions
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Articles read",
              value: weekArticles,
              dot: "bg-emerald-500",
            },
            { label: "Notes added", value: weekNotes, dot: "bg-blue-500" },
            {
              label: "Reading streak",
              value: readingStreak,
              dot: "bg-violet-500",
            },
            { label: "AI uses", value: weekAi, dot: "bg-rose-400" },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -2, transition: softSpring }}
              className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {item.value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <span
                className={`h-2 w-2 rounded-full ${item.dot}`}
                aria-hidden
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div id="weekly-goal-target" className="scroll-mt-24">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          Set weekly target
        </p>
        <div className="flex flex-wrap gap-2">
          {targetOptions.map((val) => (
            <button
              key={val}
              onClick={() => onSetWeeklyGoal(val)}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-all ${
                weeklyGoal === val
                  ? "border-slate-900 bg-slate-900 text-white shadow-md dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-500"
              }`}
            >
              {val}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="99"
              value={!targetOptions.includes(weeklyGoal) ? weeklyGoal : ""}
              placeholder="Custom"
              onChange={(e) =>
                onSetWeeklyGoal(parseInt(e.target.value, 10) || 1)
              }
              className={`h-10 w-24 rounded-2xl border px-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:bg-slate-800/60 dark:text-slate-300 ${
                !targetOptions.includes(weeklyGoal)
                  ? "border-slate-900 bg-slate-900 text-white placeholder-white/60 dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-100/80 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-950/20">
        <Flame className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          {weeklyStreak}
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          week streak — keep it going!
        </span>
      </div>
    </Panel>
  );
}

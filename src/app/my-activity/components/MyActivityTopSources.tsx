"use client";

import { motion } from "framer-motion";
import { EmptyStateText, Panel, softSpring } from "./MyActivityUi";

interface MyActivityTopSourcesProps {
  sourceCounts: Array<[string, number]>;
}

export default function MyActivityTopSources({
  sourceCounts,
}: MyActivityTopSourcesProps) {
  return (
    <Panel
      title="Top sources"
      description="Sources are ranked from usage behavior during the selected period."
    >
      {sourceCounts.length > 0 ? (
        (() => {
          const total = sourceCounts.reduce((sum, [, count]) => sum + count, 0);

          return (
            <div className="grid min-w-0 gap-4 sm:gap-x-10 sm:gap-y-6 sm:grid-cols-2">
              {sourceCounts.map(([source, count], idx) => {
                const max = sourceCounts[0]?.[1] ?? 1;
                const percent = Math.max((count / max) * 100, 10);
                const share =
                  total > 0 ? Math.round((count / total) * 1000) / 10 : 0;

                return (
                  <motion.div
                    key={source}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      y: -2,
                      borderColor: "rgba(16, 185, 129, 0.4)",
                    }}
                    transition={{ ...softSpring, delay: idx * 0.04 }}
                    className="group relative min-w-0 flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 transition-colors dark:border-slate-800/50 dark:bg-slate-900/40"
                  >
                    <div className="flex items-center justify-between gap-3 px-0.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {source}
                      </span>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                        {share}%
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{
                          ...softSpring,
                          delay: 0.2 + idx * 0.05,
                        }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,_rgba(16,185,129,0.95),_rgba(59,130,246,0.75))] shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })()
      ) : (
        <EmptyStateText>No source activity yet.</EmptyStateText>
      )}
    </Panel>
  );
}

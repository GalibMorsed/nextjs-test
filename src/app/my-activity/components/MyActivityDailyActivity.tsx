"use client";

import { motion } from "framer-motion";
import { Panel, softSpring } from "./MyActivityUi";

type ChartBucket = {
  label: string;
  count: number;
};

interface MyActivityDailyActivityProps {
  chartBuckets: ChartBucket[];
}

export default function MyActivityDailyActivity({
  chartBuckets,
}: MyActivityDailyActivityProps) {
  const max = Math.max(...chartBuckets.map((entry) => entry.count), 1);

  return (
    <Panel
      title="Daily reading activity"
      description="A visual trend area for usage over time."
    >
      <div className="flex h-[280px] items-end gap-4 rounded-[24px] border border-slate-200/80 bg-white px-4 pb-6 pt-8 dark:border-slate-700 dark:bg-slate-950/40">
        {chartBuckets.map((item, index) => {
          const height = Math.max(
            (item.count / max) * 180,
            item.count > 0 ? 24 : 8,
          );

          return (
            <div
              key={item.label}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.count}
              </div>
              <div className="flex h-[180px] w-full items-end">
                <motion.div
                  initial={{ height: 0, opacity: 0.7 }}
                  animate={{ height: `${height}px`, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                    delay: 0.12 + index * 0.08,
                  }}
                  className="relative w-full overflow-hidden rounded-t-2xl bg-[linear-gradient(180deg,_rgba(16,185,129,0.95),_rgba(20,184,166,0.78)_58%,_rgba(59,130,246,0.72))]"
                  title={`${item.label}: ${item.count}`}
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-[12%] top-2 h-5 rounded-full bg-white/20 blur-sm"
                    animate={{
                      x: ["-6%", "7%", "-4%"],
                      y: [0, 3, 0],
                      scaleX: [1, 1.12, 0.96],
                    }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.15,
                    }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute -bottom-2 left-[18%] h-10 w-[68%] rounded-full bg-emerald-300/30 blur-md dark:bg-emerald-200/20"
                    animate={{
                      x: ["-10%", "8%", "-6%"],
                      scaleX: [0.94, 1.06, 0.98],
                      scaleY: [1, 0.92, 1],
                    }}
                    transition={{
                      duration: 4.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2 + index * 0.12,
                    }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[1px] bg-white/50"
                    animate={{ opacity: [0.35, 0.7, 0.35] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1,
                    }}
                  />
                </motion.div>
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

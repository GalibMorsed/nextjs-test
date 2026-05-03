"use client";

import { useRouter } from "next/navigation";
import { useUserPlan } from "@/app/plans/payments/useUserPlan";
import { Lock } from "lucide-react";

type PlanGateProps = {
  requires: "pro" | "proplus";
  children: React.ReactNode;
};

export default function PlanGate({ requires, children }: PlanGateProps) {
  const { isPro, isProPlus, isActive, loading } = useUserPlan();
  const router = useRouter();

  if (loading) return null;

  const hasAccess =
    isActive &&
    (requires === "pro" ? isPro || isProPlus : isProPlus);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-10 text-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
          <Lock className="h-6 w-6 text-teal-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {requires === "proplus" ? "Pro+ Feature" : "Pro Feature"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          This feature is available on the{" "}
          <span className="font-semibold text-teal-600">
            {requires === "proplus" ? "Pro+" : "Pro"}
          </span>{" "}
          plan. Upgrade to unlock it.
        </p>
        <button
          onClick={() => router.push("/plans")}
          className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
"use client";

import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import LottiePlayer from "@/app/components/LottiePlayer";

type AuthOnboardingStageProps = {
  title?: string;
  description?: string;
  isVisible?: boolean;
};

const setupSteps = [
  "Verifying your account",
  "Securing your session",
];

export default function AuthOnboardingStage({
  title = "Setting up your NextNews experience",
  description = "Please stay with us while we finish authentication and prepare your workspace.",
  isVisible = true,
}: AuthOnboardingStageProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md transition-opacity duration-200 ${
        isVisible
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Authentication in progress"
      aria-hidden={!isVisible}
    >
      <section className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-white p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
        <div className="pointer-events-none absolute -left-14 -top-14 h-36 w-36 rounded-full bg-amber-200/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-sky-200/80 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 shadow-lg shadow-sky-100 ring-1 ring-sky-100">
              <LottiePlayer
                src="/auth/Loading%2040%20_%20Paperplane.json"
                className="h-14 w-14"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                NextNews onboarding
              </p>
              <h2 className="mt-1 text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
                {title}
              </h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>

          <div className="space-y-3">
            {setupSteps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                {index === 0 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
            We will send you to home once everything is ready.
          </div>
        </div>
      </section>
    </div>
  );
}

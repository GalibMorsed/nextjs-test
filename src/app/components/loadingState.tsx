import { Loader2, Newspaper, Sparkles } from "lucide-react";

interface LoadingStateProps {
  title: string;
  description: string;
  emoji?: string;
}

export default function LoadingState({
  title,
  description,
  emoji = "✨",
}: LoadingStateProps) {
  return (
    <main className="relative min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#ffffff)] dark:hidden" />
      <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-6 shadow-lg backdrop-blur sm:p-8">
          <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-100/80 dark:bg-blue-900/40 blur-2xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-16 -right-10 h-40 w-40 rounded-full bg-rose-100/70 dark:bg-rose-900/30 blur-2xl animate-pulse" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              <Newspaper className="h-4 w-4" />
              <span>Preparing content</span>
              <span aria-hidden="true">{emoji}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                {title}
              </h1>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/70 px-4 py-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Loading your experience...
              </p>
              <Sparkles className="ml-auto h-4 w-4 text-amber-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-11/12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse [animation-delay:120ms]" />
              <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse [animation-delay:240ms]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

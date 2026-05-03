"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/plans");
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10">
        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-rose-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Something went wrong during checkout. No amount has been deducted.
          Please try again or choose a different payment method.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          Redirecting to plans page in {countdown}s...
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(plan ? `/plans?plan=${plan}` : "/plans")}
            className="w-full rounded-xl bg-rose-600 text-white py-3 font-semibold hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/support")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
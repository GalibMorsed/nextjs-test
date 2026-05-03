"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      if (plan) {
        router.push(`/plans?plan=${plan}`);
      } else {
        router.push("/plans");
      }
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, router]);

  const planLabel =
    plan === "pro_monthly" ? "Pro (Monthly)"
    : plan === "pro_yearly" ? "Pro (Yearly)"
    : plan === "proplus_monthly" ? "Pro+ (Monthly)"
    : plan === "proplus_yearly" ? "Pro+ (Yearly)"
    : "Premium";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-teal-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          You're now on the <span className="font-semibold text-teal-600">{planLabel}</span> plan.
          Welcome to NextNews premium!
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          Redirecting to your plans page in {countdown}s...
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full rounded-xl bg-teal-600 text-white py-3 font-semibold hover:bg-teal-700 transition-colors"
        >
          Start Reading Now
        </button>
      </div>
    </div>
  );
}
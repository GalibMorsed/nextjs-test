"use client";

import { useState } from "react";
import clsx from "clsx";

export type PlanKey =
  | "pro_monthly"
  | "pro_yearly"
  | "proplus_monthly"
  | "proplus_yearly";

type ChoosePlanProps = {
  planKey: PlanKey;
  label?: string;
  className?: string;
  disabled?: boolean;
  onError?: (message: string) => void;
};

export default function ChoosePlan({
  planKey,
  label = "Continue to secure checkout",
  className,
  disabled,
  onError,
}: ChoosePlanProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planKey }),
      });

      const payload = (await response.json()) as {
        checkout_url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start checkout");
      }

      if (!payload.checkout_url) {
        throw new Error("Checkout URL was not returned");
      }

      window.location.assign(payload.checkout_url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed";
      if (onError) {
        onError(message);
      } else {
        window.location.assign("/checkout/failure");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={clsx(
        "rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        loading || disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
          : "bg-teal-600 text-white hover:bg-teal-700",
        className,
      )}
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}

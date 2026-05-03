"use client";

import { useEffect, useState } from "react";
import { loadUserSubscriptionPlan, type SubscriptionPlanRecord } from "@/app/services/subscriptionPlanService";

export function useUserPlan() {
  const [plan, setPlan] = useState<SubscriptionPlanRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSubscriptionPlan().then(({ data }) => {
      setPlan(data);
      setLoading(false);
    });
  }, []);

  const isPro = plan?.plan_key === "pro_monthly" || plan?.plan_key === "pro_yearly";
  const isProPlus = plan?.plan_key === "proplus_monthly" || plan?.plan_key === "proplus_yearly";
  const isFree = plan?.plan_key === "free";
  const isActive = plan?.status === "active";

  return { plan, loading, isPro, isProPlus, isFree, isActive };
}
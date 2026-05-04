import { useCallback, useEffect, useState } from "react";
import {
  ACTIVITY_DATA_EVENT,
  readActivityAnalytics,
} from "@/lib/activityAnalytics";
import { loadUserSubscriptionPlan } from "@/app/services/subscriptionPlanService";
import { AI_FREE_LIMIT, FREE_PLAN_COOLDOWN_DAYS } from "@/lib/aiUsageLimit";

export function useAILimit() {
  const [hasPaidPlan, setHasPaidPlan] = useState(false);
  const [totalAIUsage, setTotalAIUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [planLimit, setPlanLimit] = useState(0);
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null);
  const [isFreePlanCooldown, setIsFreePlanCooldown] = useState(false);

  const refreshUsageState = useCallback(async () => {
    const [activity, planResult] = await Promise.all([
      readActivityAnalytics().catch(() => null),
      loadUserSubscriptionPlan().catch(() => ({ data: null })),
    ]);

    const plan = planResult?.data;
    const isExemptFromFreeLimit = Boolean(plan?.status === "active" || plan?.status === "canceled");
    const isUnlimitedPlan =
      (Boolean(plan?.status === "active") && Boolean(plan?.plan_credit_is_unlimited)) ||
      (Boolean(plan?.status === "active") && plan?.plan_credit_amount === 0);
    const isTrulyFreeUser = !plan;

    // Use weighted credit system for all users
    const aiWeightedUsage =
      (activity?.aiSummaryCount || 0) * 1 +
      (activity?.personalizationSuggestionCount || 0) * 2 +
      (activity?.regionSuggestionCount || 0) * 2;

    const otherUsage = (activity?.articleReadCount || 0);
    const otherEventsCount = (activity?.events || [])
      .filter(e => !["ai_summary", "personalization_suggestion", "region_suggestion", "article_open"].includes(e.type))
      .length;

    const weightedCreditUsage = aiWeightedUsage + otherUsage + otherEventsCount;

    let isLocked = false;
    let nextAvail: string | null = null;
    let isCooldown = false;

    if (isExemptFromFreeLimit) {
      if (!isUnlimitedPlan) {
        const planCredits = plan?.plan_credit_amount || 0;
        isLocked = weightedCreditUsage >= planCredits;
      }
    } else if (isTrulyFreeUser) {
      isLocked = weightedCreditUsage >= AI_FREE_LIMIT;

      if (isLocked && typeof window !== "undefined") {
        const cooldownKey = "free_plan_cooldown_end";
        const savedCooldownEnd = localStorage.getItem(cooldownKey);

        if (savedCooldownEnd) {
          const cooldownEndTime = new Date(savedCooldownEnd).getTime();
          const now = new Date().getTime();

          if (now < cooldownEndTime) {
            isCooldown = true;
            nextAvail = savedCooldownEnd;
          } else {
            localStorage.removeItem(cooldownKey);
          }
        } else {
          const cooldownEndTime = new Date(Date.now() + FREE_PLAN_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
          localStorage.setItem(cooldownKey, cooldownEndTime.toISOString());
          isCooldown = true;
          nextAvail = cooldownEndTime.toISOString();
        }
      }
    }

    return {
      total: weightedCreditUsage,
      isExempt: isExemptFromFreeLimit,
      isLocked,
      planCredits: plan?.plan_credit_amount || 0,
      isUnlimited: isUnlimitedPlan,
      nextAvailableAt: nextAvail,
      isFreePlanCooldown: isCooldown,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      try {
        const next = await refreshUsageState();
        if (!mounted) return;
        setTotalAIUsage(next.total);
        setHasPaidPlan(next.isExempt);
        setIsUnlimited(next.isUnlimited);
        setPlanLimit(next.planCredits);
        setNextAvailableAt(next.nextAvailableAt);
        setIsFreePlanCooldown(next.isFreePlanCooldown);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void sync();

    const onActivityUpdated = () => {
      void sync();
    };
    const onFocus = () => {
      void sync();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    };

    window.addEventListener(ACTIVITY_DATA_EVENT, onActivityUpdated);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(() => {
      void sync();
    }, 10000);

    return () => {
      mounted = false;
      window.removeEventListener(ACTIVITY_DATA_EVENT, onActivityUpdated);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [refreshUsageState]);

  const isLocked = hasPaidPlan
    ? (!isUnlimited && planLimit > 0 && totalAIUsage >= planLimit)
    : (totalAIUsage >= AI_FREE_LIMIT);

  return {
    isLocked,
    totalAIUsage,
    limit: hasPaidPlan ? planLimit : AI_FREE_LIMIT,
    loading,
    isActive: hasPaidPlan,
    isUnlimited,
    nextAvailableAt,
    isFreePlanCooldown,
  };
}

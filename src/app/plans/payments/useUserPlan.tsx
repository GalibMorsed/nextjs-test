"use client";

import { useEffect, useState } from "react";
import {
  loadUserSubscriptionPlan,
  syncSubscriptionPlanCache,
  type SubscriptionPlanRecord,
} from "@/app/services/subscriptionPlanService";

type CachedPlanTier = "free" | "pro" | "proplus";

type CachedPlanSnapshot = {
  tier: CachedPlanTier | null;
  isActive: boolean | null;
};

function hasLocalAuth() {
  if (typeof window === "undefined") return false;

  const authToken = localStorage.getItem("auth_token")?.trim();
  const authEmail = localStorage.getItem("auth_email")?.trim();

  return Boolean(authToken || authEmail);
}

function getCachedPlanSnapshot(): CachedPlanSnapshot {
  if (typeof window === "undefined" || !hasLocalAuth()) {
    return { tier: null, isActive: null };
  }

  const rawPlanName = localStorage.getItem("nextnews-plan")?.trim();
  if (!rawPlanName) {
    return { tier: null, isActive: null };
  }

  const normalizedPlan = rawPlanName.toLowerCase().replace(/\s+/g, "");
  let tier: CachedPlanTier | null = null;

  if (normalizedPlan === "pro+" || normalizedPlan === "proplus") {
    tier = "proplus";
  } else if (normalizedPlan === "pro") {
    tier = "pro";
  } else if (normalizedPlan === "free") {
    tier = "free";
  }

  const expiryValue = localStorage.getItem("nextnews-plan-expiry");
  let isActive: boolean | null = null;

  if (expiryValue) {
    const expiryDate = new Date(expiryValue);
    if (!Number.isNaN(expiryDate.getTime())) {
      isActive = expiryDate.getTime() > Date.now();
    }
  }

  return { tier, isActive };
}

export function useUserPlan() {
  const [plan, setPlan] = useState<SubscriptionPlanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [cachedTier, setCachedTier] = useState<CachedPlanTier | null>(null);
  const [cachedActive, setCachedActive] = useState<boolean | null>(null);

  useEffect(() => {
    const syncCachedPlan = () => {
      const { tier, isActive } = getCachedPlanSnapshot();
      setCachedTier(tier);
      setCachedActive(isActive);
    };

    syncCachedPlan();
    window.addEventListener("storage", syncCachedPlan);
    window.addEventListener("focus", syncCachedPlan);

    return () => {
      window.removeEventListener("storage", syncCachedPlan);
      window.removeEventListener("focus", syncCachedPlan);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadUserSubscriptionPlan()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setLoading(false);
          return;
        }
        syncSubscriptionPlanCache(data);
        setPlan(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isPro =
    plan?.plan_key === "pro_monthly" ||
    plan?.plan_key === "pro_yearly" ||
    cachedTier === "pro";
  const isProPlus =
    plan?.plan_key === "proplus_monthly" ||
    plan?.plan_key === "proplus_yearly" ||
    cachedTier === "proplus";
  const isFree = plan?.plan_key === "free" || cachedTier === "free";
  const isActive = plan ? plan.status === "active" : (cachedActive ?? false);

  return {
    plan,
    loading,
    isPro,
    isProPlus,
    isFree,
    isActive,
    hasCachedPlan: cachedTier !== null,
  };
}

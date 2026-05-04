import { createClient } from "@supabase/supabase-js";

export const AI_FREE_LIMIT = 20;
export const FREE_PLAN_COOLDOWN_DAYS = 12;

type UsageDecision = {
  totalAIUsage: number;
  isLocked: boolean;
  hasPaidPlan: boolean;
  nextAvailableAt?: string | null;
  isFreePlanCooldown?: boolean;
};

type PlanRow = {
  plan_key?: string | null;
  status?: string | null;
  plan_credit_amount?: number | null;
  plan_credit_is_unlimited?: boolean | null;
  free_plan_next_available_at?: string | null;
};

type ActivityData = {
  aiSummaryCount?: number;
  personalizationSuggestionCount?: number;
  regionSuggestionCount?: number;
  articleReadCount?: number;
  events?: unknown[];
};

function toCount(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
}

function getValidatedSupabaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).toString();
  } catch {
    return null;
  }
}

function createUserScopedSupabase(token: string) {
  const url = getValidatedSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function evaluateAiUsageAccess(
  token: string,
): Promise<UsageDecision> {
  const client = createUserScopedSupabase(token);
  if (!client) {
    return { totalAIUsage: 0, isLocked: false, hasPaidPlan: false };
  }

  const [{ data: planData }, { data: activityData }] = await Promise.all([
    client
      .from("user_subscription_plans")
      .select("plan_key,status,plan_credit_amount,plan_credit_is_unlimited")
      .maybeSingle<PlanRow>(),
    client.from("user_activities").select("activity_data").maybeSingle(),
  ]);

  const plan = planData ?? null;
  const isExemptFromFreeLimit = Boolean(plan?.status === "active" || plan?.status === "canceled");
  const isUnlimited = Boolean(plan?.status === "active" && plan?.plan_credit_is_unlimited);
  const isTrulyFreeUser = !plan;

  const activity = (activityData?.activity_data ?? {}) as ActivityData;

  // Apply weighted credit system for all users
  // Summaries = 1, Suggestions = 2, Others = 1
  const aiWeightedUsage =
    toCount(activity.aiSummaryCount) * 1 +
    toCount(activity.personalizationSuggestionCount) * 2 +
    toCount(activity.regionSuggestionCount) * 2;

  const otherUsage = toCount(activity.articleReadCount);

  const otherEventsCount = Array.isArray(activity.events)
    ? activity.events.filter((e: any) =>
      !["ai_summary", "personalization_suggestion", "region_suggestion", "article_open"].includes(e?.type)
    ).length
    : 0;

  const weightedCreditUsage = aiWeightedUsage + otherUsage + otherEventsCount;

  let isLocked = false;
  let nextAvailableAt: string | null = null;
  let isFreePlanCooldown = false;

  if (isExemptFromFreeLimit) {
    // If they have a plan, locked only if credits exhausted
    if (!isUnlimited) {
      const planCredits = toCount(plan?.plan_credit_amount);
      isLocked = weightedCreditUsage >= planCredits;
    }
  } else if (isTrulyFreeUser) {
    // Free users use weighted credit system with 20 limit
    isLocked = weightedCreditUsage >= AI_FREE_LIMIT;

    // If locked, check for cooldown using localStorage
    if (isLocked && typeof window !== "undefined") {
      const cooldownKey = "free_plan_cooldown_end";
      const savedCooldownEnd = localStorage.getItem(cooldownKey);

      if (savedCooldownEnd) {
        const cooldownEndTime = new Date(savedCooldownEnd).getTime();
        const now = new Date().getTime();

        if (now < cooldownEndTime) {
          isFreePlanCooldown = true;
          nextAvailableAt = savedCooldownEnd;
        } else {
          localStorage.removeItem(cooldownKey);
        }
      } else {
        // First time hitting limit, set cooldown
        const cooldownEndTime = new Date(Date.now() + FREE_PLAN_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
        localStorage.setItem(cooldownKey, cooldownEndTime.toISOString());
        isFreePlanCooldown = true;
        nextAvailableAt = cooldownEndTime.toISOString();
      }
    }
  }

  return {
    totalAIUsage: weightedCreditUsage,
    hasPaidPlan: isExemptFromFreeLimit,
    isLocked,
    nextAvailableAt,
    isFreePlanCooldown,
  };
}

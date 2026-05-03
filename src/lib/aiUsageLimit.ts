import { createClient } from "@supabase/supabase-js";

export const AI_FREE_LIMIT = 20;

type UsageDecision = {
  totalAIUsage: number;
  isLocked: boolean;
  hasPaidPlan: boolean;
};

type PlanRow = {
  plan_key?: string | null;
  status?: string | null;
  plan_credit_amount?: number | null;
  plan_credit_is_unlimited?: boolean | null;
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
  const isExemptFromFreeLimit = Boolean(plan?.status === "active") || (toCount(plan?.plan_credit_amount) > 0);
  const isUnlimited = Boolean(plan?.plan_credit_is_unlimited);

  const activity = (activityData?.activity_data ?? {}) as ActivityData;
  
  // 1. Standard Count for Non-Plan users (Total AI uses)
  const totalAIUsageCount =
    toCount(activity.aiSummaryCount) +
    toCount(activity.personalizationSuggestionCount) +
    toCount(activity.regionSuggestionCount);

  // 2. Weighted Credit usage for Plan users
  // Summaries = 1, Suggestions = 2, Others = 1
  const aiWeightedUsage =
    toCount(activity.aiSummaryCount) * 1 +
    toCount(activity.personalizationSuggestionCount) * 2 +
    toCount(activity.regionSuggestionCount) * 2;
  
  const otherUsage = toCount(activity.articleReadCount);
  
  // Total usage should avoid double-counting if events contains the same items
  // Since we don't have a dedicated "other" counter, we estimate it from events
  const otherEventsCount = Array.isArray(activity.events) 
    ? activity.events.filter((e: any) => 
        !["ai_summary", "personalization_suggestion", "region_suggestion", "article_open"].includes(e?.type)
      ).length 
    : 0;

  const weightedCreditUsage = aiWeightedUsage + otherUsage + otherEventsCount;

  let isLocked = false;
  if (isExemptFromFreeLimit) {
    // If they have a plan, they are locked only if they run out of credits (and are not unlimited)
    if (!isUnlimited) {
      const planCredits = toCount(plan?.plan_credit_amount);
      isLocked = weightedCreditUsage >= planCredits;
    }
  } else {
    // No plan users follow the standard 20-use limit
    isLocked = totalAIUsageCount >= AI_FREE_LIMIT;
  }

  return {
    totalAIUsage: isExemptFromFreeLimit ? weightedCreditUsage : totalAIUsageCount,
    hasPaidPlan: isExemptFromFreeLimit,
    isLocked,
  };
}

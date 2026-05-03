"use client";

import { supabase } from "../../../lib/superbaseClient";
import { getVerifiedAuthUser } from "@/lib/clientAuth";

export type PlanKey =
    | "free"
    | "pro_monthly"
    | "pro_yearly"
    | "proplus_monthly"
    | "proplus_yearly";

export type BillingCycle = "monthly" | "yearly" | "none";

export type SubscriptionPlanRecord = {
    id: string;
    user_id: string;
    user_email: string;
    plan_key: PlanKey;
    plan_name: string;
    billing_cycle: BillingCycle;
    status: string;
    provider: string;
    provider_customer_id: string | null;
    provider_subscription_id: string | null;
    provider_checkout_session_id: string | null;
    provider_product_id: string | null;
    currency: string;
    amount_minor: number;
    amount_display: string | number;
    plan_credit_amount: number;
    plan_credit_label: string;
    plan_credit_unit: string;
    plan_credit_period: string;
    plan_credit_is_unlimited: boolean;
    plan_credit_snapshot: Record<string, unknown>;
    free_plan_last_used_at: string | null;
    free_plan_next_available_at: string | null;
    free_plan_cooldown_days: number;
    free_plan_use_count: number;
    current_period_start: string | null;
    current_period_end: string | null;
    trial_end: string | null;
    canceled_at: string | null;
    cancel_at_period_end: boolean;
    entitlement_data: Record<string, unknown>;
    billing_details: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
};

type PlanDefinition = {
    planKey: PlanKey;
    planName: string;
    billingCycle: BillingCycle;
    amountDisplay: number;
    amountMinor: number;
    currentPeriodEndDays: number | null;
    creditAmount: number;
    creditLabel: string;
    creditPeriod: string;
    creditIsUnlimited: boolean;
};

const FREE_PLAN_ACCESS_DAYS = 7;
const FREE_PLAN_COOLDOWN_DAYS = 30;

const PLAN_DEFINITIONS: Record<PlanKey, PlanDefinition> = {
    free: {
        planKey: "free",
        planName: "Free",
        billingCycle: "none",
        amountDisplay: 0,
        amountMinor: 0,
        currentPeriodEndDays: FREE_PLAN_ACCESS_DAYS,
        creditAmount: 600,
        creditLabel: "600 API call credits for 7 days",
        creditPeriod: "7_days",
        creditIsUnlimited: false,
    },
    pro_monthly: {
        planKey: "pro_monthly",
        planName: "Pro",
        billingCycle: "monthly",
        amountDisplay: 99,
        amountMinor: 9900,
        currentPeriodEndDays: 30,
        creditAmount: 8000,
        creditLabel: "8,000 API call credits per month",
        creditPeriod: "monthly",
        creditIsUnlimited: false,
    },
    pro_yearly: {
        planKey: "pro_yearly",
        planName: "Pro",
        billingCycle: "yearly",
        amountDisplay: 899,
        amountMinor: 89900,
        currentPeriodEndDays: 365,
        creditAmount: 200000,
        creditLabel: "200,000 API call credits per year",
        creditPeriod: "yearly",
        creditIsUnlimited: false,
    },
    proplus_monthly: {
        planKey: "proplus_monthly",
        planName: "Pro+",
        billingCycle: "monthly",
        amountDisplay: 299,
        amountMinor: 29900,
        currentPeriodEndDays: 30,
        creditAmount: 45000,
        creditLabel: "45,000 API call credits per month",
        creditPeriod: "monthly",
        creditIsUnlimited: false,
    },
    proplus_yearly: {
        planKey: "proplus_yearly",
        planName: "Pro+",
        billingCycle: "yearly",
        amountDisplay: 2299,
        amountMinor: 229900,
        currentPeriodEndDays: 365,
        creditAmount: 0,
        creditLabel: "Unlimited API call credits per year",
        creditPeriod: "yearly",
        creditIsUnlimited: true,
    },
};

function buildPlanPayload(
    userId: string,
    userEmail: string,
    planKey: PlanKey,
) {
    const definition = PLAN_DEFINITIONS[planKey];
    const now = new Date();
    const currentPeriodEnd =
        definition.currentPeriodEndDays !== null
            ? new Date(
                now.getTime() + definition.currentPeriodEndDays * 24 * 60 * 60 * 1000,
            ).toISOString()
            : null;

    return {
        user_id: userId,
        user_email: userEmail,
        plan_key: definition.planKey,
        plan_name: definition.planName,
        billing_cycle: definition.billingCycle,
        status: "active",
        provider: "dodopayments",
        currency: "INR",
        amount_minor: definition.amountMinor,
        amount_display: definition.amountDisplay,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd,
        provider_customer_id: null,
        provider_subscription_id: null,
        provider_checkout_session_id: null,
        provider_product_id: null,
        metadata: {
            source: planKey === "free" ? "free-plan" : "checkout",
            plan_key: definition.planKey,
            plan_name: definition.planName,
            billing_cycle: definition.billingCycle,
        },
        entitlement_data: {},
        billing_details: {},
        cancel_at_period_end: false,
        canceled_at: null,
        trial_end:
            planKey === "free"
                ? new Date(
                    now.getTime() + FREE_PLAN_ACCESS_DAYS * 24 * 60 * 60 * 1000,
                ).toISOString()
                : null,
    };
}

export function getPlanDefinition(planKey: PlanKey) {
    return PLAN_DEFINITIONS[planKey];
}

export function isPlanKey(planKey: string | null | undefined): planKey is PlanKey {
    return (
        planKey === "free" ||
        planKey === "pro_monthly" ||
        planKey === "pro_yearly" ||
        planKey === "proplus_monthly" ||
        planKey === "proplus_yearly"
    );
}

export async function loadUserSubscriptionPlan() {
    const { user, error } = await getVerifiedAuthUser();
    if (error || !user) {
        return { data: null as SubscriptionPlanRecord | null, error: error ?? null };
    }

    const { data, error: queryError } = await supabase
        .from("user_subscription_plans")
        .select(
            "id, user_id, user_email, plan_key, plan_name, billing_cycle, status, provider, provider_customer_id, provider_subscription_id, provider_checkout_session_id, provider_product_id, currency, amount_minor, amount_display, plan_credit_amount, plan_credit_label, plan_credit_unit, plan_credit_period, plan_credit_is_unlimited, plan_credit_snapshot, free_plan_last_used_at, free_plan_next_available_at, free_plan_cooldown_days, free_plan_use_count, current_period_start, current_period_end, trial_end, canceled_at, cancel_at_period_end, entitlement_data, billing_details, metadata, created_at, updated_at",
        )
        .eq("user_id", user.id)
        .maybeSingle<SubscriptionPlanRecord>();

    if (queryError) {
        return { data: null as SubscriptionPlanRecord | null, error: queryError };
    }

    return { data: data ?? null, error: null };
}

export async function canUseFreePlan() {
    const { user, error } = await getVerifiedAuthUser();
    if (error || !user) {
        return { allowed: false, error: error ?? new Error("Not logged in") };
    }

    const { data, error: rpcError } = await supabase.rpc("can_use_free_plan", {
        p_user_id: user.id,
    });

    if (rpcError) {
        return { allowed: false, error: rpcError };
    }

    const row = Array.isArray(data) ? data[0] : null;
    return {
        allowed: Boolean(row?.allowed),
        nextAvailableAt: row?.next_available_at ?? null,
        cooldownDays: row?.cooldown_days ?? FREE_PLAN_COOLDOWN_DAYS,
        error: null,
    };
}

export async function savePlanToDatabase(planKey: PlanKey) {
    const { user, error } = await getVerifiedAuthUser();
    if (error || !user) {
        return { data: null as SubscriptionPlanRecord | null, error: error ?? null };
    }

    if (!user.email) {
        return {
            data: null as SubscriptionPlanRecord | null,
            error: new Error("User email is required to store plan details."),
        };
    }

    const payload = buildPlanPayload(user.id, user.email, planKey);

    const { data, error: upsertError } = await supabase
        .from("user_subscription_plans")
        .upsert(payload, { onConflict: "user_id" })
        .select(
            "id, user_id, user_email, plan_key, plan_name, billing_cycle, status, provider, provider_customer_id, provider_subscription_id, provider_checkout_session_id, provider_product_id, currency, amount_minor, amount_display, plan_credit_amount, plan_credit_label, plan_credit_unit, plan_credit_period, plan_credit_is_unlimited, plan_credit_snapshot, free_plan_last_used_at, free_plan_next_available_at, free_plan_cooldown_days, free_plan_use_count, current_period_start, current_period_end, trial_end, canceled_at, cancel_at_period_end, entitlement_data, billing_details, metadata, created_at, updated_at",
        )
        .single<SubscriptionPlanRecord>();

    if (upsertError) {
        return { data: null as SubscriptionPlanRecord | null, error: upsertError };
    }

    return { data, error: null };
}

export async function cancelPlanInDatabase() {
    const { user, error } = await getVerifiedAuthUser();
    if (error || !user) {
        return { data: null as SubscriptionPlanRecord | null, error: error ?? null };
    }

    const { data: existingPlan, error: loadError } = await supabase
        .from("user_subscription_plans")
        .select("id, plan_key")
        .eq("user_id", user.id)
        .maybeSingle<{ id: string; plan_key: PlanKey }>();

    if (loadError) {
        return { data: null as SubscriptionPlanRecord | null, error: loadError };
    }

    if (!existingPlan) {
        return {
            data: null as SubscriptionPlanRecord | null,
            error: new Error("No active subscription plan found."),
        };
    }

    const { data, error: updateError } = await supabase
        .from("user_subscription_plans")
        .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            cancel_at_period_end: false,
            current_period_end: new Date().toISOString(),
            trial_end: null,
            metadata: {
                canceled_by: "plans-page",
                canceled_source: "ui",
            },
        })
        .eq("user_id", user.id)
        .select(
            "id, user_id, user_email, plan_key, plan_name, billing_cycle, status, provider, provider_customer_id, provider_subscription_id, provider_checkout_session_id, provider_product_id, currency, amount_minor, amount_display, plan_credit_amount, plan_credit_label, plan_credit_unit, plan_credit_period, plan_credit_is_unlimited, plan_credit_snapshot, free_plan_last_used_at, free_plan_next_available_at, free_plan_cooldown_days, free_plan_use_count, current_period_start, current_period_end, trial_end, canceled_at, cancel_at_period_end, entitlement_data, billing_details, metadata, created_at, updated_at",
        )
        .single<SubscriptionPlanRecord>();

    if (updateError) {
        return { data: null as SubscriptionPlanRecord | null, error: updateError };
    }

    return { data, error: null };
}

export function syncSubscriptionPlanCache(plan: SubscriptionPlanRecord | null) {
    if (typeof window === "undefined") return;

    if (!plan) {
        localStorage.removeItem("nextnews-plan");
        localStorage.removeItem("nextnews-plan-date");
        localStorage.removeItem("nextnews-plan-expiry");
        return;
    }

    localStorage.setItem("nextnews-plan", plan.plan_name);
    localStorage.setItem("nextnews-plan-date", plan.current_period_start ?? new Date().toISOString());

    if (plan.plan_key === "free" && plan.trial_end) {
        localStorage.setItem("nextnews-plan-expiry", plan.trial_end);
    } else if (plan.plan_key !== "free" && plan.current_period_end) {
        localStorage.setItem("nextnews-plan-expiry", plan.current_period_end);
    } else {
        localStorage.removeItem("nextnews-plan-expiry");
    }
}

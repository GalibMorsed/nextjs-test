import { loadUserSubscriptionPlan } from "@/app/services/subscriptionPlanService";
import { NextResponse } from "next/server";

export async function requirePlan(minPlan: "pro" | "proplus") {
  const { data: plan } = await loadUserSubscriptionPlan();

  if (!plan || plan.status !== "active") {
    return NextResponse.json({ error: "No active plan" }, { status: 403 });
  }

  const isPro = plan.plan_key.startsWith("pro");
  const isProPlus = plan.plan_key.startsWith("proplus");

  if (minPlan === "proplus" && !isProPlus) {
    return NextResponse.json({ error: "Pro+ required" }, { status: 403 });
  }

  if (minPlan === "pro" && !isPro && !isProPlus) {
    return NextResponse.json({ error: "Pro required" }, { status: 403 });
  }

  return null; // means access granted
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DodoPayments } from "dodopayments";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_KEY_MAP: Record<string, string> = {
  [process.env.DODO_PAYMENT_NEXTNEWS_PRO_MONTHLY_PRODUCT_ID?.trim() ?? ""]: "pro_monthly",
  [process.env.DODO_PAYMENT_NEXTNEWS_PRO_YEARLY_PRODUCT_ID?.trim() ?? ""]: "pro_yearly",
  [process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_MONTHLY_PRODUCT_ID?.trim() ?? ""]: "proplus_monthly",
  [process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_YEARLY_PRODUCT_ID?.trim() ?? ""]: "proplus_yearly",
};

const WEBHOOK_KEY =
  process.env.DODO_PAYMENT_WEBHOOK_KEY?.trim() ||
  process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim() ||
  "";

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENT_API_KEY,
  environment:
    process.env.DODO_PAYMENT_ENVIRONMENT === "test_mode" ? "test_mode" : "live_mode",
  webhookKey: WEBHOOK_KEY || undefined,
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
  };

  if (!WEBHOOK_KEY) {
    console.error("Missing DODO_PAYMENT_WEBHOOK_KEY/DODO_PAYMENTS_WEBHOOK_KEY");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let payload: { type: string; data: any };
  try {
    payload = dodo.webhooks.unwrap(rawBody, { headers }) as { type: string; data: any };
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = payload?.type as string;
  const data = payload?.data;

  console.log("Dodo webhook received:", eventType);

  try {
    if (eventType === "subscription.active" || eventType === "payment.succeeded") {
      const productId = data?.product_id ?? data?.product_cart?.[0]?.product_id;
      const customerEmail = data?.customer?.email || data?.customer_email;
      const subscriptionId = data?.subscription_id ?? data?.id ?? null;
      const customerId = data?.customer?.customer_id ?? null;
      const periodStart =
        data?.previous_billing_date ?? data?.created_at ?? new Date().toISOString();
      const periodEnd = data?.next_billing_date ?? data?.current_period_end ?? null;
      const planKey = PLAN_KEY_MAP[productId];

      if (!planKey || !customerEmail) {
        console.warn("Unknown product or missing email:", productId, customerEmail);
        return NextResponse.json({ received: true });
      }

      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      const user = userData?.users?.find((u) => u.email === customerEmail);
      if (userError || !user) {
        console.error("User not found for email:", customerEmail);
        return NextResponse.json({ received: true, warning: "User not found" });
      }

      const { error: upsertError } = await supabase
        .from("user_subscription_plans")
        .upsert(
          {
            user_id: user.id,
            user_email: customerEmail,
            plan_key: planKey,
            plan_name: planKey.startsWith("proplus") ? "Pro+" : "Pro",
            billing_cycle: planKey.includes("yearly") ? "yearly" : "monthly",
            status: "active",
            provider: "dodopayments",
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            provider_product_id: productId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            canceled_at: null,
            metadata: {
              source: "webhook",
              event: eventType,
              received_at: new Date().toISOString(),
            },
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Error updating subscription:", upsertError);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.failed") {
      const customerEmail = data?.customer?.email || data?.customer_email;
      if (customerEmail) {
        await supabase
          .from("user_subscription_plans")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            cancel_at_period_end: false,
          })
          .eq("user_email", customerEmail);
      }
    }

    if (eventType === "payment.failed") {
      console.error("Payment failed event received:", data);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

"use strict";

require("dotenv").config();

const axios = require("axios");
const { Webhook } = require("standardwebhooks");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getArg(name, fallback = null) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.slice(name.length + 3);
}

async function ensureTestUser(supabaseAdmin, email) {
  try {
    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createRes?.data?.user?.id) {
      return createRes.data.user;
    }
  } catch (e) {
    // ignore and try to find user
  }

  const list = await supabaseAdmin.auth.admin.listUsers();
  const user = list?.data?.users?.find((u) => u.email === email) || null;
  if (!user) throw new Error("Failed to ensure test user exists");
  return user;
}

async function main() {
  const endpoint =
    process.env.SIM_WEBHOOK_URL ||
    "https://nextnews.co.in/api/webhooks/dodo";

  const secret =
    (process.env.DODO_PAYMENT_WEBHOOK_KEY || "").trim() ||
    (process.env.DODO_PAYMENTS_WEBHOOK_KEY || "").trim();

  if (!secret) {
    throw new Error(
      "Missing DODO_PAYMENT_WEBHOOK_KEY/DODO_PAYMENTS_WEBHOOK_KEY in environment"
    );
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin credentials in environment");
  }

  const productIdArg = getArg("product", null);
  const fallbackProduct =
    (process.env.DODO_PAYMENT_NEXTNEWS_PRO_MONTHLY_PRODUCT_ID || "").trim() ||
    (process.env.DODO_PAYMENT_NEXTNEWS_PRO_YEARLY_PRODUCT_ID || "").trim() ||
    (process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_MONTHLY_PRODUCT_ID || "").trim() ||
    (process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_YEARLY_PRODUCT_ID || "").trim();

  const productId = productIdArg || fallbackProduct;
  if (!productId) {
    throw new Error("No product id provided via --product and no env fallback available");
  }

  const emailArg = getArg("email", null);
  const email =
    emailArg ||
    `test.dodo.webhook+${Date.now()}@example.com`;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const testUser = await ensureTestUser(supabaseAdmin, email);

  const now = new Date();
  const next = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const payload = {
    business_id: "biz_test_mcp",
    type: "payment.succeeded",
    timestamp: now.toISOString(),
    data: {
      payload_type: "Payment",
      id: `pay_test_${Date.now()}`,
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email,
        customer_id: `cus_test_${Date.now()}`,
      },
      previous_billing_date: now.toISOString(),
      created_at: now.toISOString(),
      next_billing_date: next.toISOString(),
      status: "succeeded",
      currency: "INR",
      total_amount: 0,
    },
  };

  const wh = new Webhook(secret);
  const webhookId = crypto.randomUUID();
  const tsSeconds = Math.floor(Date.now() / 1000);
  const bodyString = JSON.stringify(payload);
  const signature = wh.sign(webhookId, new Date(tsSeconds * 1000), bodyString);

  const headers = {
    "webhook-id": webhookId,
    "webhook-timestamp": tsSeconds,
    "webhook-signature": signature,
    "content-type": "application/json",
  };

  const res = await axios.post(endpoint, bodyString, {
    headers,
    validateStatus: () => true,
  });

  console.log("webhook_response_status", res.status);
  try {
    console.log("webhook_response_body", JSON.stringify(res.data));
  } catch {
    console.log("webhook_response_body_parse_error");
  }

  await sleep(2000);

  const { data: row, error: qErr } = await supabaseAdmin
    .from("user_subscription_plans")
    .select(
      "user_id, user_email, plan_key, status, provider, provider_product_id, current_period_start, current_period_end"
    )
    .eq("user_email", email)
    .maybeSingle();

  if (qErr) {
    console.log("db_query_error", qErr.message || String(qErr));
  }

  console.log(
    "simulation_result",
    JSON.stringify({
      endpoint,
      email,
      productId,
      webhookStatus: res.status,
      dbRow: row || null,
    })
  );
}

main().catch((err) => {
  console.error("simulation_failed", err.message || String(err));
  process.exit(1);
});
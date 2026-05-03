"use strict";

require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { Webhook } = require("standardwebhooks");

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function getArg(name, fallback = null) {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!found) return fallback;
  return found.slice(name.length + 3);
}

async function ensureTestUser({ supabaseUrl, serviceKey, email }) {
  const base = supabaseUrl.replace(/\/+$/, "");
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };

  // Try create
  try {
    const { data } = await axios.post(
      `${base}/auth/v1/admin/users`,
      { email, email_confirm: true },
      { headers }
    );
    if (data && data.id) return data;
  } catch (e) {
    // If already exists, proceed to lookup
    if (!(e.response && (e.response.status === 409 || e.response.status === 422))) {
      // Some Supabase projects may return 422 for duplicate
      // fall through to GET lookup anyway
    }
  }

  // Lookup by email
  const { data: list } = await axios.get(
    `${base}/auth/v1/admin/users`,
    { params: { email }, headers }
  );
  const user =
    (Array.isArray(list) ? list.find((u) => u.email === email) : list?.users?.find((u) => u.email === email)) ||
    null;
  if (!user) throw new Error("Failed to ensure test user exists");
  return user;
}

async function querySubscriptionRow({ supabaseUrl, serviceKey, email }) {
  const base = supabaseUrl.replace(/\/+$/, "");
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
  };
  const params = {
    select:
      "user_id,user_email,plan_key,status,provider,provider_product_id,current_period_start,current_period_end",
    user_email: `eq.${email}`,
    limit: 1,
  };
  const { data } = await axios.get(`${base}/rest/v1/user_subscription_plans`, {
    headers,
    params,
  });
  if (Array.isArray(data) && data.length > 0) return data[0];
  return null;
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
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase admin credentials (URL/SERVICE_ROLE_KEY) in .env");
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
    emailArg || `test.dodo.webhook+${Date.now()}@example.com`;

  await ensureTestUser({ supabaseUrl, serviceKey, email });

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
    "webhook-timestamp": String(tsSeconds),
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

  await sleep(2500);

  const row = await querySubscriptionRow({ supabaseUrl, serviceKey, email });

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
  console.error("simulation_failed", err && err.message ? err.message : String(err));
  process.exit(1);
});
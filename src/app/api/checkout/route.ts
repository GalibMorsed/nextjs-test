import { NextRequest, NextResponse } from "next/server";
import { DodoPayments } from "dodopayments";

type PlanKey = "pro_monthly" | "pro_yearly" | "proplus_monthly" | "proplus_yearly";

const PRODUCT_IDS: Record<PlanKey, string | undefined> = {
    pro_monthly: process.env.DODO_PAYMENT_NEXTNEWS_PRO_MONTHLY_PRODUCT_ID,
    pro_yearly: process.env.DODO_PAYMENT_NEXTNEWS_PRO_YEARLY_PRODUCT_ID,
    proplus_monthly: process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_MONTHLY_PRODUCT_ID,
    proplus_yearly: process.env.DODO_PAYMENT_NEXTNEWS_PRO_PLUS_YEARLY_PRODUCT_ID,
};

function getDodoClient() {
    return new DodoPayments({
        bearerToken: process.env.DODO_PAYMENT_API_KEY,
        environment:
            process.env.DODO_PAYMENT_ENVIRONMENT === "test_mode"
                ? "test_mode"
                : process.env.DODO_PAYMENT_ENVIRONMENT === "live_mode"
                    ? "live_mode"
                    : undefined,
    });
}

function isPlanKey(plan: unknown): plan is PlanKey {
    return (
        plan === "pro_monthly" ||
        plan === "pro_yearly" ||
        plan === "proplus_monthly" ||
        plan === "proplus_yearly"
    );
}

export async function POST(req: NextRequest) {
    try {
        if (!process.env.DODO_PAYMENT_API_KEY) {
            return NextResponse.json(
                { error: "Missing DODO_PAYMENT_API_KEY" },
                { status: 500 },
            );
        }

        const { plan, email, name } = (await req.json()) as {
            plan?: unknown;
            email?: string;
            name?: string;
        };

        if (!isPlanKey(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const productId = PRODUCT_IDS[plan];
        if (!productId) {
            return NextResponse.json(
                { error: `Missing product id for ${plan}` },
                { status: 500 },
            );
        }

        const returnUrl =
            process.env.DODO_PAYMENT_RETURN_URL?.trim()
                ? `${process.env.DODO_PAYMENT_RETURN_URL.trim()}?plan=${encodeURIComponent(plan)}`
                : new URL(`/checkout/success?plan=${encodeURIComponent(plan)}`, req.url).toString();

        const failureUrl =
            process.env.DODO_PAYMENT_FAILURE_URL?.trim()
                ? `${process.env.DODO_PAYMENT_FAILURE_URL.trim()}?plan=${encodeURIComponent(plan)}`
                : new URL(`/checkout/failure?plan=${encodeURIComponent(plan)}`, req.url).toString();

        const dodo = getDodoClient();
        const session = await dodo.checkoutSessions.create({
            product_cart: [{ product_id: productId, quantity: 1 }],
            customer: email
                ? {
                    email,
                    ...(name ? { name } : {}),
                }
                : undefined,
            return_url: returnUrl,
            cancel_url: failureUrl,
            feature_flags: {
                allow_customer_editing_email: true,
                allow_customer_editing_name: true,
                redirect_immediately: true,
            },
        });

        return NextResponse.json({ checkout_url: session.checkout_url });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
    }
}
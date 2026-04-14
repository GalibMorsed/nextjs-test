// @ts-ignore Deno resolves remote modules at runtime in Edge Functions.
// @ts-nocheck
// Deno Edge Functions resolve remote imports and globals at runtime.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
    env: {
        get(name: string): string | undefined;
    };
    serve(
        handler: (request: Request) => Response | Promise<Response>,
    ): void;
};

type NewsApiArticle = {
    source?: { name?: string | null } | null;
    title?: string | null;
    description?: string | null;
    url?: string | null;
    urlToImage?: string | null;
    publishedAt?: string | null;
};

type NewsApiResponse = {
    status?: string;
    message?: string;
    articles?: NewsApiArticle[];
};

const RESEND_BATCH_ENDPOINT = "https://api.resend.com/emails/batch";
const DEFAULT_COUNTRY = "us";
const DEFAULT_MAX_ARTICLES = 5;
const DEFAULT_MAX_RECIPIENTS = 100;
const RESEND_BATCH_SIZE = 100;
const LIST_USERS_PER_PAGE = 100;
const MAX_USER_PAGES = 100;

function getEnv(name: string): string {
    const value = Deno.env.get(name)?.trim();
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
}

function parsePositiveInt(value: string | undefined, fallback: number, max: number) {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.min(Math.floor(parsed), max);
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getBearerToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
    const token = authHeader.slice(7).trim();
    return token || null;
}

function getApiKeyHeader(request: Request): string | null {
    const apiKeyHeader = request.headers.get("apikey")?.trim();
    return apiKeyHeader || null;
}

function getProjectRefFromSupabaseUrl(url: string): string | null {
    try {
        const host = new URL(url).hostname;
        return host.split(".")[0] || null;
    } catch {
        return null;
    }
}

function decodeBase64Url(value: string): string | null {
    try {
        const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
        const padLength = normalized.length % 4;
        const padded = padLength === 0 ? normalized : normalized + "=".repeat(4 - padLength);
        return atob(padded);
    } catch {
        return null;
    }
}

function isProjectAnonJwt(token: string, projectRef: string): boolean {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payloadRaw = decodeBase64Url(parts[1]);
    if (!payloadRaw) return false;

    try {
        const payload = JSON.parse(payloadRaw) as { role?: string; ref?: string };
        return payload.role === "anon" && payload.ref === projectRef;
    } catch {
        return false;
    }
}

async function fetchTopHeadlines(country: string, maxArticles: number) {
    const apiKey =
        Deno.env.get("NEWS_API_KEY")?.trim() ||
        Deno.env.get("NEWS_API_KEY2")?.trim() ||
        Deno.env.get("NEWS_API_KEY3")?.trim();

    if (!apiKey) {
        throw new Error(
            "Missing NEWS API key. Set NEWS_API_KEY2 (or NEWS_API_KEY / NEWS_API_KEY3).",
        );
    }

    const endpoint = `https://newsapi.org/v2/top-headlines?country=${encodeURIComponent(country)}&page=1&pageSize=${maxArticles}&apiKey=${apiKey}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = (await response.json()) as NewsApiResponse;

    if (!response.ok) {
        throw new Error(payload.message || `Failed to fetch headlines (${response.status}).`);
    }

    const normalized = Array.isArray(payload.articles)
        ? payload.articles
            .map((article) => {
                const title = (article.title ?? "").trim();
                const url = (article.url ?? "").trim();

                if (!title || !url) return null;

                return {
                    title,
                    url,
                    description: (article.description ?? "").trim(),
                    source: (article.source?.name ?? "Unknown source").trim() || "Unknown source",
                    publishedAt: (article.publishedAt ?? "").trim(),
                    imageUrl: (article.urlToImage ?? "").trim(),
                };
            })
            .filter(
                (article): article is {
                    title: string;
                    url: string;
                    description: string;
                    source: string;
                    publishedAt: string;
                    imageUrl: string;
                } => Boolean(article),
            )
        : [];

    return normalized;
}

function buildDigestSubject() {
    const dateLabel = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    }).format(new Date());

    return `Your Morning Top Headlines - ${dateLabel}`;
}

function buildDigestHtml(
    articles: Array<{
        title: string;
        url: string;
        description: string;
        source: string;
        publishedAt: string;
        imageUrl: string;
    }>,
) {
    const appUrl = "https://www.nextnews.co.in/";
    
    const headlineItems = articles
        .map((article) => {
            const sourceText = escapeHtml(article.source);
            const titleText = escapeHtml(article.title);
            const descriptionText = escapeHtml(article.description || "Click to read the full story on NextNews.");
            const publishedText = article.publishedAt
                ? `<span style="color: #6b7280; font-size: 12px; display: inline-block;">${escapeHtml(new Date(article.publishedAt).toLocaleString())}</span>`
                : "";

            const imageHtml = article.imageUrl
                ? `<a href="${appUrl}" style="display: block; text-decoration: none;">
                     <img src="${escapeHtml(article.imageUrl)}" alt="${titleText}" style="width: 100%; height: 200px; object-fit: cover; display: block;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';"/>
                   </a>`
                : `<a href="${appUrl}" style="display: block; text-decoration: none;">
                     <div style="width: 100%; height: 120px; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center;">
                       <span style="color: #9ca3af; font-size: 14px;">NextNews</span>
                     </div>
                   </a>`;

            return `
            <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-bottom: 24px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                ${imageHtml}
                <div style="padding: 20px;">
                    <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="background-color: #111827; color: #ffffff; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; display: inline-block;">${sourceText}</span>
                        ${publishedText}
                    </div>
                    <h2 style="margin: 0 0 12px; font-size: 18px; line-height: 1.4;">
                        <a href="${appUrl}" style="color: #111827; text-decoration: none; font-weight: 700;">${titleText}</a>
                    </h2>
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                        ${descriptionText}
                    </p>
                    <div style="border-top: 1px solid #f3f4f6; padding-top: 16px;">
                        <a href="${appUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center;">Read Full Story &rarr;</a>
                    </div>
                </div>
            </div>`;
        })
        .join("\n");

    const categories = ["Technology", "Business", "Entertainment", "Health", "Science", "Sports"];
    const categoriesHtml = categories.map(cat => 
        `<a href="${appUrl}" style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 6px 14px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 600; margin: 4px;">${cat}</a>`
    ).join("");

    return `<!doctype html>
<html>
    <body style="margin:0;padding:20px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;">
            <!-- Header -->
            <div style="text-align:center;padding:24px 0;">
                <h1 style="margin:0 0 8px;color:#111827;font-size:28px;font-weight:800;letter-spacing:-0.5px;">NextNews</h1>
                <p style="margin:0;color:#6b7280;font-size:16px;">Your Daily Morning Brief</p>
            </div>

            <!-- Articles -->
            <div style="margin-bottom: 24px;">
                ${headlineItems}
            </div>

            <!-- Trending Categories -->
            <div style="background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #f3f4f6;text-align:center;margin-bottom:32px;">
                <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;">&#128293; Trending Categories Today</h2>
                <div style="margin-bottom:20px;">
                    ${categoriesHtml}
                </div>
                <a href="${appUrl}" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 2px 4px rgba(37,99,235,0.2);">Explore More on NextNews</a>
            </div>

            <!-- Footer -->
            <div style="text-align:center;color:#9ca3af;font-size:13px;line-height:1.6;padding-bottom:24px;">
                <p style="margin:0 0 8px;">You're receiving this because you want to stay updated with NextNews.</p>
                <p style="margin:0;">
                    <a href="${appUrl}" style="color:#6b7280;text-decoration:underline;">Visit NextNews</a> &bull; 
                    <a href="${appUrl}" style="color:#6b7280;text-decoration:underline;">Manage Preferences</a>
                </p>
            </div>
        </div>
    </body>
</html>`;
}

function buildDigestText(
    articles: Array<{
        title: string;
        url: string;
        description: string;
        source: string;
        publishedAt: string;
        imageUrl: string;
    }>,
) {
    const appUrl = "https://www.nextnews.co.in/";
    const lines = [
        "NextNews Morning Brief",
        "======================",
        "",
        "Top headlines for today:",
        "",
    ];

    articles.forEach((article, index) => {
        lines.push(`${index + 1}. ${article.title}`);
        lines.push(`Source: ${article.source}`);
        if (article.description) lines.push(article.description);
        if (article.publishedAt) {
            lines.push(`Published: ${new Date(article.publishedAt).toLocaleString()}`);
        }
        lines.push(`Read more on our app: ${appUrl}`);
        lines.push("");
        lines.push("----------------------");
        lines.push("");
    });

    lines.push("🔥 Trending Categories Today:");
    lines.push("Technology, Business, Entertainment, Health, Science, Sports");
    lines.push(`Explore more: ${appUrl}`);
    lines.push("");
    lines.push("You are receiving this because you have a registered account on NextNews.");
    return lines.join("\n");
}

async function listRegisteredEmails(
    adminClient: ReturnType<typeof createClient>,
    requireConfirmedEmail: boolean,
) {
    const recipients = new Set<string>();

    for (let page = 1; page <= MAX_USER_PAGES; page += 1) {
        const { data, error } = await adminClient.auth.admin.listUsers({
            page,
            perPage: LIST_USERS_PER_PAGE,
        });

        if (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }

        const users = data?.users ?? [];
        if (!users.length) break;

        for (const user of users) {
            const email = user.email?.trim().toLowerCase();
            if (!email) continue;
            if (requireConfirmedEmail && !user.email_confirmed_at) continue;
            recipients.add(email);
        }

        if (users.length < LIST_USERS_PER_PAGE) break;
    }

    return Array.from(recipients);
}

async function sendDigestBatch(
    resendApiKey: string,
    fromAddress: string,
    subject: string,
    html: string,
    text: string,
    recipients: string[],
) {
    if (!recipients.length) return;

    const payload = recipients.map((email) => ({
        from: fromAddress,
        to: [email],
        subject,
        html,
        text,
    }));

    const response = await fetch(RESEND_BATCH_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend batch send failed (${response.status}): ${body}`);
    }
}

Deno.serve(async (request: Request) => {
    try {
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const supabaseUrl = getEnv("SUPABASE_URL");
        const projectRef = getProjectRefFromSupabaseUrl(supabaseUrl);
        const anonKey = getEnv("SUPABASE_ANON_KEY");
        const bearerToken = getBearerToken(request);
        const apiKeyHeader = getApiKeyHeader(request);
        const providedToken = bearerToken || apiKeyHeader;
        const matchesAnonSecret = Boolean(providedToken && providedToken === anonKey);
        const matchesProjectAnon = Boolean(
            projectRef && providedToken && isProjectAnonJwt(providedToken, projectRef),
        );

        if (!matchesAnonSecret && !matchesProjectAnon) {
            return new Response(
                "Unauthorized. Use SUPABASE_ANON_KEY in Authorization Bearer header (or apikey header).",
                { status: 401 },
            );
        }

        const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
        const resendApiKey = getEnv("RESEND_API_KEY");
        const resendFromEmail = getEnv("RESEND_FROM_EMAIL");
        const resendFromName = Deno.env.get("RESEND_FROM_NAME")?.trim();

        const requireConfirmedEmail =
            (Deno.env.get("DAILY_DIGEST_REQUIRE_CONFIRMED_EMAIL") ?? "true")
                .trim()
                .toLowerCase() !== "false";
        const maxArticles = parsePositiveInt(
            Deno.env.get("DAILY_DIGEST_MAX_ARTICLES")?.trim(),
            DEFAULT_MAX_ARTICLES,
            20,
        );
        const maxRecipients = parsePositiveInt(
            Deno.env.get("DAILY_DIGEST_MAX_RECIPIENTS")?.trim(),
            DEFAULT_MAX_RECIPIENTS,
            50000,
        );
        const country =
            Deno.env.get("DAILY_DIGEST_NEWS_COUNTRY")?.trim().toLowerCase() ||
            DEFAULT_COUNTRY;

        const resendFromAddress = resendFromName
            ? `${resendFromName} <${resendFromEmail}>`
            : resendFromEmail;

        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        });

        const allEmails = await listRegisteredEmails(
            adminClient,
            requireConfirmedEmail,
        );

        if (!allEmails.length) {
            return new Response(
                JSON.stringify({
                    ok: true,
                    message: "No registered users found for digest delivery.",
                    recipientsProcessed: 0,
                }),
                { headers: { "Content-Type": "application/json" } },
            );
        }

        const recipients = allEmails.slice(0, maxRecipients);
        const headlines = await fetchTopHeadlines(country, maxArticles);

        if (!headlines.length) {
            return new Response(
                JSON.stringify({ ok: false, error: "No headlines available." }),
                { status: 502, headers: { "Content-Type": "application/json" } },
            );
        }

        const subject = buildDigestSubject();
        const html = buildDigestHtml(headlines);
        const text = buildDigestText(headlines);

        for (let index = 0; index < recipients.length; index += RESEND_BATCH_SIZE) {
            const chunk = recipients.slice(index, index + RESEND_BATCH_SIZE);
            await sendDigestBatch(
                resendApiKey,
                resendFromAddress,
                subject,
                html,
                text,
                chunk,
            );
        }

        return new Response(
            JSON.stringify({
                ok: true,
                message: "Daily morning digest sent to registered users.",
                recipientsProcessed: recipients.length,
                recipientsSkippedByLimit: Math.max(0, allEmails.length - recipients.length),
                headlineCount: headlines.length,
                country,
                requireConfirmedEmail,
            }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        return new Response(
            JSON.stringify({ ok: false, error: message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
});

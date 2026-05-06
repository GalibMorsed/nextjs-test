type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

const rateLimitStore = new Map<string, RateLimitEntry>();
const ALLOWED_FETCH_SITES = new Set(["same-origin", "same-site", "none"]);

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function normalizeOriginCandidate(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getRequestHost(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  const host = request.headers.get("host")?.trim();
  return forwardedHost || host || null;
}

export function getRequestOrigin(request: Request): string | null {
  const explicitOrigin = normalizeOriginCandidate(request.headers.get("origin"));
  if (explicitOrigin) return explicitOrigin;

  const refererOrigin = normalizeOriginCandidate(request.headers.get("referer"));
  if (refererOrigin) return refererOrigin;

  const host = getRequestHost(request);
  if (!host) return null;

  const protocol = request.headers.get("x-forwarded-proto")?.trim() || "https";
  return `${protocol}://${host}`;
}

export function isTrustedSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite && !ALLOWED_FETCH_SITES.has(fetchSite)) {
    return false;
  }

  const host = getRequestHost(request);
  const requestOrigin = getRequestOrigin(request);
  if (!host || !requestOrigin) return false;

  try {
    return new URL(requestOrigin).host === host;
  } catch {
    return false;
  }
}

export function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  for (const [entryKey, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) rateLimitStore.delete(entryKey);
  }

  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: limit - current.count };
}

export async function verifySupabaseAccessToken(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !anonKey || !token) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { id?: string; email?: string };
    if (!data.id) return null;

    return data;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  return verifySupabaseAccessToken(token);
}

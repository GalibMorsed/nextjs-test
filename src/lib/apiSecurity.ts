type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number };

const rateLimitStore = new Map<string, RateLimitEntry>();

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

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim();
}

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    (error.message ?? "").toLowerCase().includes("schema cache")
  );
}

function getValidatedSupabaseUrl(): string | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl).toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getValidatedSupabaseUrl();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPERBASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE;

  if (!url) {
    return NextResponse.json(
      {
        error:
          "Server not configured for account deletion. Missing or invalid: NEXT_PUBLIC_SUPABASE_URL",
      },
      { status: 500 },
    );
  }

  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Server not configured for account deletion. Missing: SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE)",
      },
      { status: 500 },
    );
  }

  let body: { confirmation?: string } = {};
  try {
    body = (await request.json()) as { confirmation?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.confirmation !== "DELETE") {
    return NextResponse.json(
      {
        error:
          "Deletion confirmation is required. Please type DELETE exactly and try again.",
      },
      { status: 400 },
    );
  }

  const adminClient = createClient(url, serviceRoleKey);

  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  const user = userData?.user ?? null;

  if (userError || !user) {
    return NextResponse.json(
      { error: `Unauthorized: ${userError?.message ?? "Invalid session token."}` },
      { status: 401 },
    );
  }

  const { error: notesDeleteError } = await adminClient
    .from("user_notes")
    .delete()
    .eq("user_id", user.id);

  if (notesDeleteError && !isMissingRelationError(notesDeleteError)) {
    return NextResponse.json(
      {
        error: `DB delete failed for user data (user_notes): ${notesDeleteError.message}`,
      },
      { status: 500 },
    );
  }

  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (authDeleteError) {
    return NextResponse.json(
      { error: `Auth delete failed: ${authDeleteError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { success: true, message: "Account deleted successfully." },
    { status: 200 },
  );
}

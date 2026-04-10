"use client";

import type { User } from "@supabase/supabase-js";
import { supabase } from "../../lib/superbaseClient";

export type TermsPolicyRow = {
  user_id: string;
  user_email: string;
  accepted_terms: boolean;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

function isNotFoundError(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

export async function getTermsPolicyRecord(userId: string) {
  const { data, error } = await supabase
    .from("user_terms_policy")
    .select(
      "user_id, user_email, accepted_terms, accepted_at, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle<TermsPolicyRow>();

  if (error && !isNotFoundError(error)) {
    throw error;
  }

  return data ?? null;
}

export async function hasAcceptedTerms(userId: string) {
  const record = await getTermsPolicyRecord(userId);
  return Boolean(record?.accepted_terms);
}

export async function upsertTermsPolicyAcceptance(
  user: Pick<User, "id" | "email">,
) {
  if (!user.id || !user.email) {
    throw new Error("User id and email are required to store T&C acceptance.");
  }

  const { data, error } = await supabase
    .from("user_terms_policy")
    .upsert(
      {
        user_id: user.id,
        user_email: user.email,
        accepted_terms: true,
        accepted_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select(
      "user_id, user_email, accepted_terms, accepted_at, created_at, updated_at",
    )
    .single<TermsPolicyRow>();

  if (error) {
    throw error;
  }

  return data;
}

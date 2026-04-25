"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../../lib/superbaseClient";
import {
  hasAcceptedTerms,
  upsertTermsPolicyAcceptance,
} from "@/lib/termsPolicy";
import { persistClientSession } from "@/lib/clientAuth";
import AuthOnboardingStage from "./authOnboardingStage";

type PendingTermsAcceptance = {
  mode: "email-signup" | "google-signup";
  email: string | null;
};

const PENDING_TERMS_KEY = "pending_terms_acceptance";
const AUTH_QUERY_PARAMS = ["code", "error", "error_code", "error_description"];
const AUTH_HASH_PARAMS = [
  "access_token",
  "expires_at",
  "expires_in",
  "provider_token",
  "refresh_token",
  "token_type",
];

function clearPendingTermsAcceptance() {
  localStorage.removeItem(PENDING_TERMS_KEY);
}

function getPendingTermsAcceptance(): PendingTermsAcceptance | null {
  const rawValue = localStorage.getItem(PENDING_TERMS_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as PendingTermsAcceptance;
  } catch {
    clearPendingTermsAcceptance();
    return null;
  }
}

function cleanAuthCallbackUrl() {
  const url = new URL(window.location.href);
  let shouldReplace = false;

  for (const param of AUTH_QUERY_PARAMS) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      shouldReplace = true;
    }
  }

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hasAuthHash = AUTH_HASH_PARAMS.some((param) => hashParams.has(param));

    if (hasAuthHash) {
      url.hash = "";
      shouldReplace = true;
    }
  }

  if (shouldReplace) {
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }
}

function hasAuthCallbackSignal() {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const hasAuthQuery = AUTH_QUERY_PARAMS.some((param) =>
    url.searchParams.has(param),
  );

  if (hasAuthQuery) return true;
  if (!window.location.hash) return false;

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  return AUTH_HASH_PARAMS.some((param) => hashParams.has(param));
}

function getAuthCallbackCode() {
  if (typeof window === "undefined") return null;
  return new URL(window.location.href).searchParams.get("code");
}

function hasPendingTermsAcceptanceSignal() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(PENDING_TERMS_KEY));
}

function showAuthBootLoader() {
  document.documentElement.classList.add("auth-boot-loading");
}

function hideAuthBootLoader() {
  document.documentElement.classList.remove("auth-boot-loading");
}

export default function AuthSessionSync() {
  const finalizedSessionKey = useRef<string | null>(null);
  const pendingSessionFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const clearPendingSessionFallbackTimer = () => {
      if (!pendingSessionFallbackTimer.current) return;
      clearTimeout(pendingSessionFallbackTimer.current);
      pendingSessionFallbackTimer.current = null;
    };

    const stopAuthenticating = () => {
      clearPendingSessionFallbackTimer();
      hideAuthBootLoader();
      if (isMounted) {
        setIsAuthenticating(false);
      }
    };

    const finalizeSession = async (
      userId: string,
      userEmail: string | undefined,
      accessToken: string,
    ) => {
      if (!userId || !userEmail || !accessToken) return;
      clearPendingSessionFallbackTimer();

      const sessionKey = `${userId}:${accessToken}`;
      if (finalizedSessionKey.current === sessionKey) {
        stopAuthenticating();
        return;
      }
      finalizedSessionKey.current = sessionKey;

      const normalizedEmail = userEmail.trim().toLowerCase();
      const pendingTerms = getPendingTermsAcceptance();
      const canCreateTermsRecord =
        pendingTerms?.mode === "google-signup" ||
        (pendingTerms?.mode === "email-signup" &&
          pendingTerms.email === normalizedEmail);

      try {
        if (isMounted) {
          setIsAuthenticating(true);
        }

        let acceptedTerms = await hasAcceptedTerms(userId);

        if (!acceptedTerms && canCreateTermsRecord) {
          await upsertTermsPolicyAcceptance({
            id: userId,
            email: userEmail,
          });
          acceptedTerms = true;
        }

        if (!acceptedTerms) {
          stopAuthenticating();
          return;
        }

        if (pendingTerms) {
          clearPendingTermsAcceptance();
        }

        if (isMounted) {
          persistClientSession(userEmail, accessToken);
          stopAuthenticating();
        }
      } catch (error) {
        finalizedSessionKey.current = null;
        stopAuthenticating();
        console.error("Unable to finalize authenticated session:", error);
      }
    };

    const syncCurrentSession = async () => {
      const hasPendingAuthWork =
        hasAuthCallbackSignal() || hasPendingTermsAcceptanceSignal();

      if (hasPendingAuthWork && isMounted) {
        showAuthBootLoader();
        setIsAuthenticating(true);
      }

      const authCallbackCode = getAuthCallbackCode();

      if (authCallbackCode) {
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(authCallbackCode);

        cleanAuthCallbackUrl();

        if (error) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            await finalizeSession(
              session.user.id,
              session.user.email,
              session.access_token,
            );
            return;
          }

          stopAuthenticating();
          console.error("Unable to exchange auth callback code:", error);
          return;
        }

        if (data.session?.user) {
          await finalizeSession(
            data.session.user.id,
            data.session.user.email,
            data.session.access_token,
          );
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      cleanAuthCallbackUrl();

      if (session?.user) {
        await finalizeSession(
          session.user.id,
          session.user.email,
          session.access_token,
        );
      } else if (hasPendingAuthWork) {
        clearPendingSessionFallbackTimer();
        pendingSessionFallbackTimer.current = setTimeout(() => {
          if (isMounted) {
            hideAuthBootLoader();
            setIsAuthenticating(false);
          }
          pendingSessionFallbackTimer.current = null;
        }, 10_000);
      } else {
        stopAuthenticating();
      }
    };

    void syncCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      cleanAuthCallbackUrl();

      if (!session?.user) {
        if (!hasPendingTermsAcceptanceSignal()) {
          stopAuthenticating();
        }
        return;
      }

      void finalizeSession(
        session.user.id,
        session.user.email,
        session.access_token,
      );
    });

    return () => {
      isMounted = false;
      clearPendingSessionFallbackTimer();
      subscription.unsubscribe();
    };
  }, []);

  return isAuthenticating ? (
    <AuthOnboardingStage
      title="Signing you in"
      description="We are confirming your secure session and loading your saved NextNews preferences."
    />
  ) : null;
}

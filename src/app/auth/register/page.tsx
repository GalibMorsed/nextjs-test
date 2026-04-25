"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../../lib/superbaseClient";
import {
  hasAcceptedTerms,
  upsertTermsPolicyAcceptance,
} from "@/lib/termsPolicy";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import AuthOnboardingStage from "@/app/auth/register/components/authOnboardingStage";
import LottiePlayer from "@/app/components/LottiePlayer";

type TermsIntent = "email-signup" | "google-signup" | null;
type PendingTermsAcceptance = {
  mode: "email-signup" | "google-signup";
  email: string | null;
};

const PENDING_TERMS_KEY = "pending_terms_acceptance";
const MOBILE_POPUP_VARIANTS = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authFinalizing, setAuthFinalizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signupCooldownUntil, setSignupCooldownUntil] = useState<number | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [termsIntent, setTermsIntent] = useState<TermsIntent>(null);
  const [termsSubmitting, setTermsSubmitting] = useState(false);
  const router = useRouter();

  const persistSession = (emailValue: string, tokenValue: string) => {
    localStorage.setItem("auth_email", emailValue);
    localStorage.setItem("auth_token", tokenValue);
    const secureFlag = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `auth_token=${encodeURIComponent(tokenValue)}; path=/; max-age=604800; samesite=lax${secureFlag}`;
  };

  const clearSession = () => {
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0; samesite=lax";
  };

  const clearPendingTermsAcceptance = () => {
    localStorage.removeItem(PENDING_TERMS_KEY);
  };

  const storePendingTermsAcceptance = (
    mode: PendingTermsAcceptance["mode"],
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    const payload: PendingTermsAcceptance = {
      mode,
      email: mode === "email-signup" ? trimmedEmail : null,
    };

    localStorage.setItem(PENDING_TERMS_KEY, JSON.stringify(payload));
  };

  const getPendingTermsAcceptance = (): PendingTermsAcceptance | null => {
    const rawValue = localStorage.getItem(PENDING_TERMS_KEY);
    if (!rawValue) return null;

    try {
      return JSON.parse(rawValue) as PendingTermsAcceptance;
    } catch {
      clearPendingTermsAcceptance();
      return null;
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (signupCooldownUntil === null) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [signupCooldownUntil]);

  const isCooldownActive =
    signupCooldownUntil !== null && currentTime < signupCooldownUntil;

  const showFormError = (message: string) => {
    setIsTermsModalOpen(false);
    setTermsIntent(null);
    setTermsAccepted(false);
    setTermsError("");
    setGoogleLoading(false);
    setLoading(false);
    setAuthFinalizing(false);
    setTermsSubmitting(false);
    setErrorMessage(message);
  };

  const denyLoginForMissingTerms = async (message: string) => {
    await supabase.auth.signOut().catch(() => {});
    clearPendingTermsAcceptance();
    clearSession();
    showFormError(message);
  };

  const finalizeAuthenticatedUser = async (
    user: User,
    accessToken: string,
    fallbackEmail: string,
  ) => {
    setAuthFinalizing(true);

    const normalizedUserEmail = (user.email ?? fallbackEmail)
      .trim()
      .toLowerCase();
    const pendingTerms = getPendingTermsAcceptance();
    const canCreateTermsRecord =
      pendingTerms?.mode === "google-signup" ||
      (pendingTerms?.mode === "email-signup" &&
        pendingTerms.email === normalizedUserEmail);

    try {
      let acceptedTerms = await hasAcceptedTerms(user.id);

      if (!acceptedTerms && canCreateTermsRecord) {
        await upsertTermsPolicyAcceptance({
          id: user.id,
          email: user.email ?? fallbackEmail,
        });
        acceptedTerms = true;
      }

      if (!acceptedTerms) {
        await denyLoginForMissingTerms(
          "Login blocked. Please accept the Terms & Conditions during signup before accessing your account.",
        );
        return false;
      }

      clearPendingTermsAcceptance();
      persistSession(user.email ?? fallbackEmail, accessToken);
      setGoogleLoading(false);
      setLoading(false);
      setAuthFinalizing(false);
      setTermsSubmitting(false);
      router.replace("/");
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not verify your Terms & Conditions status. Please try again.";

      clearSession();
      showFormError(message);
      return false;
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          clearSession();
          setAuthFinalizing(false);
          return;
        }

        await finalizeAuthenticatedUser(
          session.user,
          session.access_token ?? "",
          session.user.email ?? "",
        );
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [finalizeAuthenticatedUser]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const openTermsModal = (intent: Exclude<TermsIntent, null>) => {
    setTermsIntent(intent);
    setTermsAccepted(false);
    setTermsError("");
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    if (termsSubmitting) return;
    setIsTermsModalOpen(false);
    setTermsIntent(null);
    setTermsAccepted(false);
    setTermsError("");
  };

  const handleRegister = async () => {
    const now = Date.now();
    if (signupCooldownUntil && now < signupCooldownUntil) {
      const remaining = Math.ceil((signupCooldownUntil - now) / 1000);
      showFormError(
        `Too many signup attempts. Please wait ${remaining}s and try again.`,
      );
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      showFormError("Email and password are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (loginData.session?.user) {
      await finalizeAuthenticatedUser(
        loginData.session.user,
        loginData.session.access_token ?? "",
        trimmedEmail,
      );
      return;
    }

    setLoading(false);

    if (
      loginError &&
      !loginError.message.toLowerCase().includes("invalid login credentials")
    ) {
      showFormError(loginError.message);
      return;
    }

    openTermsModal("email-signup");
  };

  const handleTermsSubmit = async () => {
    if (!termsAccepted) {
      setTermsError("Please accept the Terms & Conditions to continue.");
      return;
    }

    setTermsSubmitting(true);
    setTermsError("");
    setErrorMessage("");

    if (termsIntent === "google-signup") {
      storePendingTermsAcceptance("google-signup");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        clearPendingTermsAcceptance();
        setTermsSubmitting(false);
        setGoogleLoading(false);
        setTermsError(
          error.message.toLowerCase().includes("missing oauth secret")
            ? "Google auth is not fully configured in Supabase. Add Google Client ID and Client Secret in Supabase Auth Providers, then retry."
            : error.message,
        );
        return;
      }

      setGoogleLoading(true);
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      showFormError("Email and password are required.");
      return;
    }

    storePendingTermsAcceptance("email-signup");

    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email: trimmedEmail,
        password,
      },
    );

    if (signupError) {
      const isRateLimited =
        (typeof (signupError as { status?: number }).status === "number" &&
          (signupError as { status?: number }).status === 429) ||
        signupError.message.toLowerCase().includes("too many requests");

      if (isRateLimited) {
        setSignupCooldownUntil(Date.now() + 60_000);
        clearPendingTermsAcceptance();
        showFormError("Too many signup attempts. Please wait and try again.");
        return;
      }

      const isAlreadyRegistered = signupError.message
        .toLowerCase()
        .includes("already registered");

      if (isAlreadyRegistered) {
        const { data: existingLoginData, error: existingLoginError } =
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

        if (existingLoginData.session?.user) {
          setIsTermsModalOpen(false);
          await finalizeAuthenticatedUser(
            existingLoginData.session.user,
            existingLoginData.session.access_token ?? "",
            trimmedEmail,
          );
          return;
        }

        clearPendingTermsAcceptance();
        showFormError(
          existingLoginError?.message ?? "Invalid login credentials.",
        );
        return;
      }

      clearPendingTermsAcceptance();
      showFormError(signupError.message);
      return;
    }

    setIsTermsModalOpen(false);

    if (signupData.session?.user) {
      await finalizeAuthenticatedUser(
        signupData.session.user,
        signupData.session.access_token ?? "",
        trimmedEmail,
      );
      return;
    }

    const { data: postSignupLoginData, error: postSignupLoginError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    if (postSignupLoginData.session?.user) {
      await finalizeAuthenticatedUser(
        postSignupLoginData.session.user,
        postSignupLoginData.session.access_token ?? "",
        trimmedEmail,
      );
      return;
    }

    clearPendingTermsAcceptance();
    showFormError(
      postSignupLoginError?.message ??
        "Account created. Please verify your email, then login again to complete Terms acceptance.",
    );
  };

  const handleGoogleRegister = async () => {
    setErrorMessage("");
    storePendingTermsAcceptance("google-signup");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      clearPendingTermsAcceptance();
      setGoogleLoading(false);
      setErrorMessage(
        error.message.toLowerCase().includes("missing oauth secret")
          ? "Google auth is not fully configured in Supabase. Add Google Client ID and Client Secret in Supabase Auth Providers, then retry."
          : error.message,
      );
    }
  };

  const showAuthOnboardingStage =
    loading || googleLoading || termsSubmitting || authFinalizing;

  return (
    <>
      <AuthOnboardingStage
        isVisible={showAuthOnboardingStage}
        title={
          googleLoading
            ? "Connecting your Google account"
            : "Checking your NextNews account"
        }
        description="We are verifying your details, accepting your preferences, and preparing a smoother first view."
      />

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-white to-sky-50 px-4 py-8 sm:px-6 md:py-10">
        <div className="pointer-events-none absolute -left-14 top-8 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl animate-float-soft motion-reduce:animate-none" />
        <div className="pointer-events-none absolute -right-16 bottom-8 h-44 w-44 rounded-full bg-sky-200/50 blur-3xl animate-float-soft-delayed motion-reduce:animate-none" />

        <div className="mx-auto grid w-full max-w-5xl gap-6 xl:grid-cols-2 xl:items-stretch">
          {/* ── Left column: branding & info ── */}
          <section className="animate-fade-up order-2 xl:order-1 flex flex-col justify-center rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-lg shadow-amber-100/50 backdrop-blur transition-transform duration-500 motion-reduce:animate-none motion-reduce:transition-none sm:p-8 xl:hover:-translate-y-0.5">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700">
              <Sparkles className="h-4 w-4" />
              Join NextNews Family
            </div>

            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              Create your account and personalize your news flow.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Get curated categories, saved preferences, and faster access
              across devices in under a minute.
            </p>

            <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-center font-medium text-sky-700">
                Save &amp; Organize Notes
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-center font-medium text-amber-700">
                Personalized Feed Setup
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center font-medium text-emerald-700">
                Reliable and secure
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2.5 text-center font-medium text-violet-700">
                Smart AI Recommendations
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs leading-relaxed text-slate-500">
                By creating an account you agree to our{" "}
                <Link
                  href="/terms-and-conditions"
                  target="_blank"
                  className="font-semibold text-slate-700 underline hover:text-slate-900"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="font-semibold text-slate-700 underline hover:text-slate-900"
                >
                  Privacy Policy
                </Link>
                . We handle your data with care — no spam, no selling, ever.
              </p>
            </div>
          </section>

          {/* ── Right column: form ── */}
          <section className="animate-fade-up order-1 xl:order-2 flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100/60 backdrop-blur transition-transform duration-500 motion-reduce:animate-none motion-reduce:transition-none sm:p-8 xl:hover:-translate-y-0.5">
            <h2 className="mb-1 text-xl font-bold text-slate-900">
              Get started for free
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Enter your details below to create your account.
            </p>

            <input
              type="email"
              placeholder="Email address"
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:-translate-y-0.5 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <input
              type="password"
              placeholder="Password"
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-300 focus:-translate-y-0.5 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />

            <button
              onClick={handleRegister}
              disabled={loading || isCooldownActive || termsSubmitting}
              className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Checking your account..."
                : isCooldownActive
                  ? "Please wait..."
                  : "Verify Account"}
            </button>

            <p className="mt-2 text-center text-xs text-slate-400">
              View our{" "}
              <button
                type="button"
                onClick={() => openTermsModal("email-signup")}
                className="text-slate-500 underline hover:text-slate-700"
              >
                Terms &amp; Conditions
              </button>
            </p>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px w-full bg-slate-200" />
              <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400">
                or
              </p>
              <div className="h-px w-full bg-slate-200" />
            </div>

            <button
              onClick={handleGoogleRegister}
              disabled={googleLoading || termsSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md hover:shadow-slate-200/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LottiePlayer
                src="/auth/Google Logo.json"
                className="w-5 h-5 scale-[2.2]"
              />
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
              <p className="text-xs font-semibold text-sky-700">
                Already have an account?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-sky-600">
                Enter your existing email &amp; password above and it will sign
                you straight in.
              </p>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isTermsModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:px-4"
            onClick={closeTermsModal}
          >
            <motion.div
              variants={MOBILE_POPUP_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.28 }}
              className="w-full rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Terms & Conditions
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Accept the policy before signup
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeTermsModal}
                  disabled={termsSubmitting}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Close Terms popup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Please review and accept our Terms &amp; Conditions to continue.
                By agreeing, you confirm that you have read and understood how
                NextNews collects, uses, and protects your information.
              </p>

              <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setTermsError("");
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href="/terms-and-conditions"
                    target="_blank"
                    className="font-semibold text-sky-700 underline"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </span>
              </label>

              {termsError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {termsError}
                </p>
              ) : null}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={closeTermsModal}
                  disabled={termsSubmitting}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTermsSubmit}
                  disabled={termsSubmitting}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {termsSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

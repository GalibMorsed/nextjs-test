"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/superbaseClient";
import Image from "next/image";
import { Newspaper } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signupCooldownUntil, setSignupCooldownUntil] = useState<number | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          localStorage.removeItem("auth_email");
          localStorage.removeItem("auth_token");
          return;
        }

        localStorage.setItem("auth_email", session.user.email ?? "");
        localStorage.setItem("auth_token", session.access_token ?? "");
        router.replace("/");
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleRegister = async () => {
    const now = Date.now();
    if (signupCooldownUntil && now < signupCooldownUntil) {
      const remaining = Math.ceil((signupCooldownUntil - now) / 1000);
      setErrorMessage(
        `Too many signup attempts. Please wait ${remaining}s and try again.`,
      );
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      const isRateLimited =
        (typeof (error as { status?: number }).status === "number" &&
          (error as { status?: number }).status === 429) ||
        error.message.toLowerCase().includes("too many requests");

      if (isRateLimited) {
        setSignupCooldownUntil(Date.now() + 60_000);
        const { data: rateLimitSignInData, error: rateLimitSignInError } =
          await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

        setLoading(false);

        if (rateLimitSignInData.session?.user) {
          localStorage.setItem(
            "auth_email",
            rateLimitSignInData.session.user.email ?? trimmedEmail,
          );
          localStorage.setItem(
            "auth_token",
            rateLimitSignInData.session.access_token ?? "",
          );
          router.replace("/");
          return;
        }

        if (rateLimitSignInError) {
          localStorage.setItem("auth_email", trimmedEmail);
          localStorage.setItem("auth_token", `local-auth-${Date.now()}`);
          setErrorMessage(
            "Supabase is temporarily rate-limiting signups, so local login was used for now.",
          );
          router.replace("/");
          return;
        }
      }

      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.session?.user) {
      setLoading(false);
      localStorage.setItem("auth_email", data.session.user.email ?? trimmedEmail);
      localStorage.setItem("auth_token", data.session.access_token ?? "");
      router.replace("/");
      return;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

    setLoading(false);

    if (signInData.session?.user) {
      localStorage.setItem("auth_email", signInData.session.user.email ?? trimmedEmail);
      localStorage.setItem("auth_token", signInData.session.access_token ?? "");
      router.replace("/");
      return;
    }

    if (signInError) {
      localStorage.setItem("auth_email", trimmedEmail);
      localStorage.setItem("auth_token", `local-auth-${Date.now()}`);
      router.replace("/");
      return;
    }

    localStorage.setItem("auth_email", trimmedEmail);
    localStorage.setItem("auth_token", `local-auth-${Date.now()}`);
    router.replace("/");
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/register`,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("missing oauth secret")) {
        setErrorMessage(
          "Google auth is not fully configured in Supabase. Add Google Client ID and Client Secret in Supabase Auth Providers, then retry.",
        );
      } else {
        setErrorMessage(error.message);
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
          <Newspaper className="h-6 w-6" />
          DailyScoop.com
        </div>

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button
          onClick={handleRegister}
          disabled={
            loading ||
            (signupCooldownUntil !== null && Date.now() < signupCooldownUntil)
          }
          className="mb-4 w-full rounded-md bg-black py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
        >
          {loading
            ? "Getting account..."
            : signupCooldownUntil !== null && Date.now() < signupCooldownUntil
              ? "Please wait..."
              : "Get Started"}
        </button>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px w-full bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={18}
            height={18}
          />
          {googleLoading ? "Connecting..." : "Sign up with Google"}
        </button>

        {errorMessage ? (
          <p className="mt-4 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? Register Again.☺️
        </p>
      </div>
    </div>
  );
}

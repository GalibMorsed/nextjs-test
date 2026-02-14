"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/superbaseClient";
import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
          <Newspaper className="h-6 w-6" />
          DailyScoop.com
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Create Account */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="mb-4 w-full rounded-md bg-black py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60"
        >
          {loading ? "Getting account..." : "Get Started"}
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-2">
          <div className="h-px w-full bg-gray-200" />
        </div>

        {/* Google signup (UI only) */}
        <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50">
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Sign up with Google
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? Register Again.☺️
        </p>
      </div>
    </div>
  );
}

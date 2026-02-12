"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { supabase } from "../../../lib/superbaseClient";

export default function Navbar({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <Link href="/" className="text-xl font-bold">
          NewsApp
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <Link href="/notes">Notes</Link>
            <span>{user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/auth/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

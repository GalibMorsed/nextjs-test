"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, Newspaper, X } from "lucide-react";
import { supabase } from "../../../lib/superbaseClient";

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileOpen: boolean;
}

export default function Navbar({ onMenuToggle, isMobileOpen }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <nav className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Newspaper className="w-6 h-8 text-gray-600" strokeWidth={1.5} />
          <span className="text-2xl font-light italic tracking-wide bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            NextNews
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
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
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onMenuToggle}
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>
  );
}

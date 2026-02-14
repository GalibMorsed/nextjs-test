"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, Newspaper, X } from "lucide-react";
import { supabase } from "../../../lib/superbaseClient";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileOpen: boolean;
}

export default function Navbar({ onMenuToggle, isMobileOpen }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localEmail, setLocalEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        setIsAuthenticated(true);
        localStorage.setItem("auth_email", sessionUser.email ?? "");
        localStorage.setItem("auth_token", data.session?.access_token ?? "");
        setLocalEmail(sessionUser.email ?? "");
        return;
      }

      const storedToken = localStorage.getItem("auth_token");
      const storedEmail = localStorage.getItem("auth_email");
      setIsAuthenticated(Boolean(storedToken));
      setLocalEmail(storedEmail ?? "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        setIsAuthenticated(true);
        localStorage.setItem("auth_email", nextUser.email ?? "");
        localStorage.setItem("auth_token", session?.access_token ?? "");
        setLocalEmail(nextUser.email ?? "");
      } else {
        setIsAuthenticated(false);
        setLocalEmail("");
        localStorage.removeItem("auth_email");
        localStorage.removeItem("auth_token");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setIsAuthenticated(false);
      setLocalEmail("");
      setUser(null);
      localStorage.removeItem("auth_email");
      localStorage.removeItem("auth_token");
      router.replace("/");
    }
  };

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
          {isAuthenticated ? (
            <>
              <Link href="/notes">Notes</Link>
              <span>{user?.email ?? localEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/register"
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

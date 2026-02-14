"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, Newspaper, X, StickyNote } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "../../../lib/superbaseClient";

interface NavbarProps {
  onMenuToggle: () => void;
  isMobileOpen: boolean;
}

export default function Navbar({ onMenuToggle, isMobileOpen }: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session?.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  const isNotesActive = pathname === "/notes";

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 md:px-6">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Newspaper className="h-8 w-6 text-gray-600" strokeWidth={1.5} />
        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-light italic tracking-wide text-transparent">
          NextNews
        </span>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              {/* Animated border */}
              <div
                className={`
                  absolute inset-0 rounded-xl
                  ${
                    isNotesActive
                      ? "opacity-100"
                      : "opacity-0 hover:opacity-100"
                  }
                  transition-opacity duration-300
                  overflow-hidden
                `}
              >
                <span
                  className="
                    absolute inset-[-100%]
                    bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.9),transparent)]
                    animate-[spin_3s_linear_infinite]
                  "
                />
              </div>

              {/* Inner button */}
              <Link
                href="/notes"
                className="
                  relative z-10
                  flex items-center gap-2
                  rounded-xl
                  bg-white
                  px-4 py-2
                  text-sm font-medium
                  text-gray-700
                  border border-gray-200
                  transition-colors duration-300
                  hover:text-indigo-600
                "
              >
                <StickyNote size={18} className="text-indigo-500" />
                Notes
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/register"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 md:hidden"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>
  );
}

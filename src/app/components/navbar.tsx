"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 md:px-6">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <Newspaper className="h-8 w-6 text-[var(--primary)]" strokeWidth={1.5} />
        <span className="text-2xl font-light italic tracking-wide text-[var(--foreground)]">
          NextNews
        </span>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/notes"
              className={`
                group relative inline-flex items-center gap-2
                rounded-xl border border-gray-200
                px-4 py-2 text-sm font-medium text-gray-700
                transition-all duration-300 ease-out
                hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md
                ${isNotesActive ? "border-[var(--primary)] text-[var(--primary)] shadow-sm" : ""}
              `}
            >
              <StickyNote
                size={18}
                className={`
                  text-[var(--primary)] transition-transform duration-300
                  group-hover:scale-110 group-hover:rotate-6
                `}
              />
              Notes
              {/* Subtle underline indicator when active or hovered */}
              <span
                className={`
                  absolute bottom-0 left-4 right-4 h-0.5 
                  bg-[var(--primary)] 
                  scale-x-0 transform origin-center
                  transition-transform duration-300 ease-out
                  group-hover:scale-x-100
                  ${isNotesActive ? "scale-x-100" : ""}
                `}
              />
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:shadow-md hover:brightness-110 hover:scale-[1.02]"
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
          className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] p-2 text-[var(--foreground)] md:hidden transition-colors hover:bg-gray-50"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
    </nav>
  );
}

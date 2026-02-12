"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Home,
  Laptop,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/superbaseClient";

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (isMobileOpen) onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onCloseMobile();
  };

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl transition text-sm font-medium ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  const content = (
    <SidebarContent
      query={query}
      setQuery={setQuery}
      handleSearch={handleSearch}
      pathname={pathname}
      navItemClass={navItemClass}
      onCloseMobile={onCloseMobile}
      user={user}
    />
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-[65px] h-[calc(100vh-65px)] w-72 bg-white border-r shadow-sm flex-col">
        {content}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.button
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden flex flex-col"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  query,
  setQuery,
  handleSearch,
  pathname,
  navItemClass,
  onCloseMobile,
  user,
}: {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (e: React.FormEvent) => void;
  pathname: string;
  navItemClass: (active: boolean) => string;
  onCloseMobile: () => void;
  user: User | null;
}) {
  const closeAndNavigate = () => onCloseMobile();

  return (
    <>
      <div className="p-6 flex-1 overflow-y-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent cursor-default"
        >
          DailyScoop
        </motion.h2>

        <form onSubmit={handleSearch} className="mb-6">
          <input
            type="text"
            placeholder="Search news..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />
        </form>

        <nav className="space-y-2">
          <Link
            href="/"
            className={navItemClass(pathname === "/")}
            onClick={closeAndNavigate}
          >
            <Home size={18} />
            Top Headlines
          </Link>
          <Link
            href="/categories/technology"
            className={navItemClass(
              pathname.startsWith("/categories/technology"),
            )}
            onClick={closeAndNavigate}
          >
            <Laptop size={18} />
            Technology
          </Link>
          <Link
            href="/categories/sports"
            className={navItemClass(pathname.startsWith("/categories/sports"))}
            onClick={closeAndNavigate}
          >
            <Trophy size={18} />
            Sports
          </Link>
          <button className="flex items-center gap-3 w-full px-4 py-2 rounded-xl hover:bg-gray-100 transition text-sm font-medium text-gray-700">
            <Settings size={18} />
            Settings
          </button>
        </nav>

        {/* Collapsible Sections */}
        <CollapsibleSection title="Extra Options">
          <p className="px-4 py-1 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            Subscriptions
          </p>
          <p className="px-4 py-1 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            Appearance
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="More Info">
          <p className="px-4 py-1 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            About NextNews
          </p>
          <p className="px-4 py-1 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            Contact Support
          </p>
        </CollapsibleSection>
      </div>

      <div className="p-4 border-t space-y-3">
        {user ? (
          <>
            <Link
              href="/notes"
              className="block w-full text-center py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium"
              onClick={closeAndNavigate}
            >
              Notes
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="block w-full text-center py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            onClick={closeAndNavigate}
          >
            Login
          </Link>
        )}
      </div>
    </>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-1 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/superbaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="text-xl font-bold">
        NewsApp
      </Link>

      <div className="flex items-center gap-4">
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

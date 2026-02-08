"use client"; // Required for useState and useRouter

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Navigate to the search page with the query parameter
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <aside className="w-64 bg-gray-50 p-4 border-r h-full min-h-screen">
      <h2 className="text-xl font-bold mb-4">Menu</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search news..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Other navigation links can go here */}
      <nav className="flex flex-col gap-2">
        <a href="/" className="hover:text-blue-600">
          Top Headlines
        </a>
        <a href="/categories/technology" className="hover:text-blue-600">
          Technology
        </a>
        <a href="/categories/sports" className="hover:text-blue-600">
          Sports
        </a>
      </nav>
    </aside>
  );
}

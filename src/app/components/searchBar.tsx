"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    router.push(`/search?q=${query}&date=${date}`);
  };

  return (
    <div className="flex gap-2">
      <input
        placeholder="Search news..."
        onChange={(e) => setQuery(e.target.value)}
      />
      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

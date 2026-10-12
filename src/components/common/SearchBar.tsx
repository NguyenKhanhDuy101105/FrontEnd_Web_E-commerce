"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bạn muốn mua gì hôm nay..."
          className="w-full bg-white text-slate-800 text-sm placeholder-slate-400 rounded-full pl-5 pr-12 py-2 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all duration-200 shadow-sm"
        />
        <button
          type="submit"
          className="absolute right-1.5 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors shadow-md"
        >
          <MagnifyingGlassIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

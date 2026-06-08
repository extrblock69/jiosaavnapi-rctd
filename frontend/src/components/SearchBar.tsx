import { Search, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative group">
      <div className="relative flex items-center transition-all duration-300 transform group-hover:scale-[1.01]">
        <Search className="absolute left-4 w-6 h-6 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs on JioSaavn..."
          className="w-full bg-[#111] text-white border border-gray-800 rounded-full py-4 pl-14 pr-12 text-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 w-6 h-6 text-gray-400 animate-spin" />
        )}
      </div>
    </form>
  );
}

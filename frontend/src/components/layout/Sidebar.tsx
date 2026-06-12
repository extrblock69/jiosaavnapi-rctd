import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Music2 } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
  ];

  const handleImportLink = () => {
    const url = prompt("Paste a JioSaavn Link (Song, Album, Playlist, or Artist):");
    if (!url) return;

    // Very basic client-side routing based on URL structure
    if (url.includes('/song/')) {
      // The API's /songs?link= handles extraction, but we need the ID to route locally.
      // Easiest is to send user to a generic loader or let them play directly.
      // But for a full clone, we can try to extract the token and route to search.
      // For now, let's just trigger a search with the full link as query which our API might handle,
      // or we can just redirect to search page. Let's redirect to search.
      window.location.href = `/search?q=${encodeURIComponent(url)}`;
    } else {
      window.location.href = `/search?q=${encodeURIComponent(url)}`;
    }
  };

  return (
    <aside className="w-64 bg-black h-full flex flex-col hidden md:flex border-r border-gray-900 relative">
      <div className="p-6 pb-2">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-2xl hover:text-green-500 transition">
          <Music2 className="w-8 h-8 text-green-500" />
          <span>JioSaavn</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-4 py-3 rounded-md font-semibold transition ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-6 h-6" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Playlist placeholder area */}
      <div className="px-4 py-4 border-t border-gray-900 flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 px-4 py-2 text-gray-400 hover:text-white transition cursor-pointer font-semibold">
          <Library className="w-6 h-6" />
          Your Library
        </div>
        <div className="mt-4 px-4 space-y-3">
          <p onClick={handleImportLink} className="text-sm font-semibold text-green-500 cursor-pointer hover:text-green-400 truncate">+ Import JioSaavn Link</p>
          <p className="text-sm text-gray-500 cursor-pointer hover:text-white truncate">Liked Songs</p>
          <p className="text-sm text-gray-500 cursor-pointer hover:text-white truncate">Hindi Top 50</p>
          <p className="text-sm text-gray-500 cursor-pointer hover:text-white truncate">Discover Weekly</p>
        </div>
      </div>
    </aside>
  );
}

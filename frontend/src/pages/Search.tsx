import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function Search() {
  const { playSong } = usePlayer();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    try {
      const response = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();
      if (data.success && data.data && data.data.results?.length > 0) {
        setSearchResults(data.data.results);
      } else {
        setError('No results found.');
      }
    } catch (err) {
      console.error('[Search] Error:', err);
      setError('An error occurred while searching.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="mt-8">
        {error && <div className="text-red-500">{error}</div>}

        {searchResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Top Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {searchResults.map((song, idx) => (
                <div key={song.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <SongCard song={song} onPlay={(s) => playSong(s, searchResults)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

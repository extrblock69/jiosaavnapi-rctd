import { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SongCard } from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

type SearchCategory = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';

export function Search() {
  const { playSong } = usePlayer();
  // Get query param 'q' if available (e.g. from the Link Importer)
  const queryParams = new URLSearchParams(window.location.search);
  const initialQuery = queryParams.get('q') || '';

  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>('songs');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialQuery) {
      // If it's a URL link importer, we should try a global search to find the entity
      fetchResults(initialQuery, 'all');
      setCategory('all');
    }
  }, []);

  const fetchResults = async (query: string, cat: SearchCategory) => {
    if (!query) return;
    setIsLoading(true);
    setError('');
    setSearchResults([]);

    let endpoint = '';
    if (cat === 'all') endpoint = '/search';
    else if (cat === 'songs') endpoint = '/search/songs';
    else if (cat === 'albums') endpoint = '/search/albums';
    else if (cat === 'artists') endpoint = '/search/artists';
    else if (cat === 'playlists') endpoint = '/search/playlists';

    try {
      const response = await fetch(`${API_BASE}${endpoint}?query=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();

      let results: any[] = [];
      if (cat === 'all' && data.data) {
        // combine top results for 'all' search
        if (data.data.songs?.results) results = [...results, ...data.data.songs.results];
        if (data.data.albums?.results) results = [...results, ...data.data.albums.results];
        if (data.data.artists?.results) results = [...results, ...data.data.artists.results];
        if (data.data.playlists?.results) results = [...results, ...data.data.playlists.results];
      } else if (data.data?.results) {
        results = data.data.results;
      }

      if (results.length > 0) {
        setSearchResults(results);
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

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    fetchResults(query, category);
  };

  const handleCategoryChange = (newCat: SearchCategory) => {
    setCategory(newCat);
    if (currentQuery) {
      fetchResults(currentQuery, newCat);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="mt-8">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'songs', 'albums', 'artists', 'playlists'] as SearchCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full font-semibold capitalize whitespace-nowrap transition-colors ${
                category === cat ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {searchResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Results for "{currentQuery}"</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {searchResults.map((item, idx) => (
                <div key={item.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <SongCard song={item} onPlay={(s) => playSong(s, searchResults.filter(i => i.type !== 'album' && i.type !== 'artist' && i.type !== 'playlist'))} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

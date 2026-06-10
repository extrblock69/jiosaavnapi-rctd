import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { SongCard } from './components/SongCard';
import { Player } from './components/Player';
import { TestMode } from './components/TestMode';
import { ApiTester } from './components/ApiTester';
import { Beaker } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showApiTester, setShowApiTester] = useState<boolean>(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    console.log(`[Search] Initiated for query: "${query}"`);
    try {
      const response = await fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log('[Search] Response data:', data);

      if (data.success && data.data && data.data.results) {
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

  const handlePlay = async (song: any) => {
    console.log('[Play] Song selected:', song);
    setCurrentSong(song);
    setStreamUrl(''); // Reset stream URL while fetching

    try {
      console.log(`[Play] Fetching details for song ID/URL: ${song.url || song.id}`);
      const linkParam = song.url ? `link=${encodeURIComponent(song.url)}` : `ids=${song.id}`;
      const response = await fetch(`${API_BASE}/songs?${linkParam}`);
      const data = await response.json();
      console.log('[Play] Song details response:', data);

      if (data.success && data.data && data.data.length > 0) {
        const songDetails = data.data[0];

        // Pick the highest quality stream URL available, or fallback
        let url = '';
        if (songDetails.downloadUrl && songDetails.downloadUrl.length > 0) {
          // try finding 320kbps
          const highestQuality = songDetails.downloadUrl.find((d: any) => d.quality === '320kbps') || songDetails.downloadUrl[songDetails.downloadUrl.length - 1];
          url = highestQuality.url;
        }

        if (url) {
          console.log(`[Play] Stream URL found: ${url}`);
          setStreamUrl(url);
        } else {
          console.warn('[Play] No stream URL found for this song.');
          alert('Could not find a valid stream for this song.');
        }
      } else {
        console.error('[Play] Failed to fetch song details.');
        alert('Failed to load song details.');
      }
    } catch (err) {
      console.error('[Play] Error fetching song details:', err);
      alert('An error occurred while trying to play the song.');
    }
  };

  if (showApiTester) {
    return <ApiTester onClose={() => setShowApiTester(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-32 relative">
      {/* Test Area Button */}
      <button
        onClick={() => setShowApiTester(true)}
        className="absolute top-4 left-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition flex items-center shadow-lg border border-gray-700 group z-40"
        title="Open API Tester Area"
      >
        <Beaker className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap px-0 group-hover:px-2 text-sm font-medium">
          API Tester Area
        </span>
      </button>

      {/* Header */}
      <TestMode />

      {/* Main Header */}
      <header className="pt-16 pb-8 px-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-8">JioSaavn Web</h1>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4">
        {error && (
          <div className="text-red-500 text-center py-8">{error}</div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 mt-8">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map((song, idx) => (
                <div key={song.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <SongCard song={song} onPlay={handlePlay} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && searchResults.length === 0 && !error && (
          <div className="text-center text-gray-500 py-20 mt-10">
            <p className="text-xl">Search for your favorite songs to start listening.</p>
          </div>
        )}
      </main>

      {/* Player */}
      {currentSong && streamUrl && (
        <Player currentSong={currentSong} streamUrl={streamUrl} />
      )}
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { SongCard } from '../components/SongCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function Home() {
  const { playSong } = usePlayer();
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For Home, we can fetch some default popular songs by searching a generic popular term
    // or we could use the /api/playlists endpoint if we knew a popular playlist ID.
    // We'll search for popular top songs here.
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE}/search/songs?query=latest&limit=15`);
        const data = await res.json();
        if (data.success && data.data && data.data.results) {
          setTrending(data.data.results);
        }
      } catch (error) {
        console.error("Failed to fetch trending songs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Good evening</h1>

      <section>
        <h2 className="text-xl font-bold mb-4">Trending Now</h2>
        {isLoading ? (
          <div className="text-gray-400">Loading hits...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trending.map((song, idx) => (
              <div key={song.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <SongCard song={song} onPlay={(s) => playSong(s, trending)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

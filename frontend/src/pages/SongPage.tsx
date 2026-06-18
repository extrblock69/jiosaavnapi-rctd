import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Play, Radio } from 'lucide-react';
import { SongCard } from '../components/SongCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function SongPage() {
  const { id } = useParams<{ id: string }>();
  const { playSong } = usePlayer();
  const [song, setSong] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchSongData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/songs/${id}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setSong(data.data[0]);
        }

        // Fetch suggestions to display at the bottom
        const sugRes = await fetch(`${API_BASE}/songs/${id}/suggestions?limit=12`);
        const sugData = await sugRes.json();
        if (sugData.success && sugData.data) {
          setSuggestions(sugData.data);
        }
      } catch (err) {
        console.error("Failed to load song", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongData();
  }, [id]);

  const handleStartRadio = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/songs/${id}/station`);
      const data = await res.json();
      if (data.success && data.data) {
        // Assume station returns an array or an object with a station ID.
        // Actually, station returns a bunch of songs. Let's push them to the queue!
        playSong(song, [song, ...Object.values(data.data)]);
      }
    } catch (e) {
      console.error("Failed to start radio", e);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-400">Loading song details...</div>;
  if (!song) return <div className="p-8 text-red-400">Song not found.</div>;

  const imageUrl = song.image?.find((i:any) => i.quality === '500x500')?.url || song.image?.[2]?.url || song.image?.[0]?.url || '/default-cover.png';

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="bg-gradient-to-b from-indigo-900/80 to-[#121212] p-8 flex flex-col md:flex-row items-end gap-6 pt-24">
        <img src={imageUrl} alt={song.title || song.name} className="w-52 h-52 shadow-2xl rounded-md object-cover hover:scale-105 transition-transform duration-500" />
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wider mb-2">Song</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4" dangerouslySetInnerHTML={{ __html: song.title || song.name || '' }}></h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span dangerouslySetInnerHTML={{ __html: song.primaryArtists || song.singers || '' }}></span>
            <span>•</span>
            <span dangerouslySetInnerHTML={{ __html: song.album || '' }}></span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 flex gap-4">
        <button
          onClick={() => playSong(song)}
          className="bg-green-500 text-black rounded-full p-4 hover:scale-105 transition shadow-xl"
          title="Play Song"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </button>

        <button
          onClick={handleStartRadio}
          className="bg-transparent border border-gray-400 text-white rounded-full px-6 py-4 hover:border-white transition shadow-xl font-bold flex items-center gap-2 uppercase tracking-wide text-sm"
          title="Start Radio Station"
        >
          <Radio className="w-5 h-5" />
          Start Radio
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="px-8 pb-8 mt-6">
          <h2 className="text-2xl font-bold mb-6">Recommended Songs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {suggestions.map((s, idx) => (
              <div key={s.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <SongCard song={s} onPlay={(sToPlay) => playSong(sToPlay, suggestions)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

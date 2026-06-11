import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';
import { SongCard } from '../components/SongCard';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function Artist() {
  const { id } = useParams<{ id: string }>();
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchArtist = async () => {
      try {
        const res = await fetch(`${API_BASE}/artists/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setArtist(data.data);
        }
      } catch (err) {
        console.error("Failed to load artist", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  if (isLoading) return <div className="p-8 text-gray-400">Loading artist...</div>;
  if (!artist) return <div className="p-8 text-red-400">Artist not found.</div>;

  const imageUrl = artist.image?.[2]?.url || artist.image?.[0]?.url || '/default-cover.png';
  const topSongs = artist.topSongs || [];
  const topAlbums = artist.topAlbums || [];

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-b from-purple-900 to-[#121212] p-8 flex items-end gap-6 pt-32">
        <img src={imageUrl} alt={artist.name} className="w-52 h-52 shadow-2xl rounded-full object-cover" />
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wider mb-2">Artist</span>
          <h1 className="text-6xl font-extrabold mb-4" dangerouslySetInnerHTML={{ __html: artist.name || '' }}></h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>{artist.followerCount ? `${artist.followerCount.toLocaleString()} followers` : ''}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        <button
          onClick={() => topSongs.length > 0 && playSong(topSongs[0], topSongs)}
          className="bg-green-500 text-black rounded-full p-4 hover:scale-105 transition shadow-xl"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </button>
      </div>

      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold mb-6 mt-4">Popular Songs</h2>
        <div className="space-y-1 mb-10">
          {topSongs.map((song: any, idx: number) => {
            const songImg = song.image?.[0]?.url || '/default-cover.png';
            const duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '-:--';

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, topSongs)}
                className="grid grid-cols-[16px_minmax(0,1fr)_1fr_minmax(120px,100px)] items-center gap-4 px-4 py-2 hover:bg-gray-800/50 rounded-md cursor-pointer group transition"
              >
                <span className="text-gray-400 group-hover:hidden">{idx + 1}</span>
                <Play className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" />
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={songImg} className="w-10 h-10 object-cover rounded" />
                  <div className="flex flex-col truncate">
                    <span className="text-white truncate" dangerouslySetInnerHTML={{ __html: song.title || song.name || '' }}></span>
                  </div>
                </div>
                <span className="text-gray-400 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.album || '' }}></span>
                <span className="text-gray-400 text-sm text-right">{duration}</span>
              </div>
            );
          })}
        </div>

        {topAlbums.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {topAlbums.map((album: any, idx: number) => (
                <div key={album.id || idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {/* Reuse SongCard for albums visually, passing empty play func as we aren't handling album clicks to player directly here without a wrapper */}
                  <SongCard song={album} onPlay={() => {}} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

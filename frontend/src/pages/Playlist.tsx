import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function Playlist() {
  const { id } = useParams<{ id: string }>();
  const { playSong } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`${API_BASE}/playlists/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPlaylist(data.data);
        }
      } catch (err) {
        console.error("Failed to load playlist", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  if (isLoading) return <div className="p-8 text-gray-400">Loading playlist...</div>;
  if (!playlist) return <div className="p-8 text-red-400">Playlist not found.</div>;

  const imageUrl = playlist.image?.[2]?.url || playlist.image?.[0]?.url || '/default-cover.png';
  const songs = playlist.songs || [];

  return (
    <div className="flex flex-col">
      <div className="bg-gradient-to-b from-blue-900 to-[#121212] p-8 flex items-end gap-6 pt-24">
        <img src={imageUrl} alt={playlist.title} className="w-52 h-52 shadow-2xl rounded-md object-cover" />
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wider mb-2">Playlist</span>
          <h1 className="text-5xl font-extrabold mb-4" dangerouslySetInnerHTML={{ __html: playlist.title || playlist.name || '' }}></h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4">
        <button
          onClick={() => songs.length > 0 && playSong(songs[0], songs)}
          className="bg-green-500 text-black rounded-full p-4 hover:scale-105 transition shadow-xl"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="grid grid-cols-[16px_minmax(0,1fr)_1fr_minmax(120px,100px)] gap-4 px-4 py-2 border-b border-gray-800 text-sm text-gray-400 mb-4">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="text-right">Time</span>
        </div>
        <div className="space-y-1">
          {songs.map((song: any, idx: number) => {
            const songImg = song.image?.[0]?.url || '/default-cover.png';
            const duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '-:--';

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className="grid grid-cols-[16px_minmax(0,1fr)_1fr_minmax(120px,100px)] items-center gap-4 px-4 py-2 hover:bg-gray-800/50 rounded-md cursor-pointer group transition"
              >
                <span className="text-gray-400 group-hover:hidden">{idx + 1}</span>
                <Play className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" />
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={songImg} className="w-10 h-10 object-cover rounded" />
                  <div className="flex flex-col truncate">
                    <span className="text-white truncate" dangerouslySetInnerHTML={{ __html: song.title || song.name || '' }}></span>
                    <span className="text-xs text-gray-400 truncate" dangerouslySetInnerHTML={{ __html: song.primaryArtists || song.singers || '' }}></span>
                  </div>
                </div>
                <span className="text-gray-400 text-sm truncate" dangerouslySetInnerHTML={{ __html: song.album || '' }}></span>
                <span className="text-gray-400 text-sm text-right">{duration}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

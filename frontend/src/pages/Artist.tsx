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

  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [songPage, setSongPage] = useState(0);
  const [albumPage, setAlbumPage] = useState(0);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

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

  useEffect(() => {
    if (artist) {
      setSongs(artist.topSongs || []);
      setAlbums(artist.topAlbums || []);
    }
  }, [artist]);

  if (isLoading) return <div className="p-8 text-gray-400">Loading artist...</div>;
  if (!artist) return <div className="p-8 text-red-400">Artist not found.</div>;

  const loadMoreSongs = async () => {
    if (!id) return;
    setLoadingSongs(true);
    try {
      const nextPage = songPage + 1;
      const res = await fetch(`${API_BASE}/artists/${id}/songs?page=${nextPage}`);
      const data = await res.json();
      if (data.success && data.data && data.data.results) {
        setSongs(prev => [...prev, ...data.data.results]);
        setSongPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSongs(false);
    }
  };

  const loadMoreAlbums = async () => {
    if (!id) return;
    setLoadingAlbums(true);
    try {
      const nextPage = albumPage + 1;
      const res = await fetch(`${API_BASE}/artists/${id}/albums?page=${nextPage}`);
      const data = await res.json();
      if (data.success && data.data && data.data.results) {
        setAlbums(prev => [...prev, ...data.data.results]);
        setAlbumPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const imageUrl = artist.image?.[2]?.url || artist.image?.[0]?.url || '/default-cover.png';

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
          onClick={() => songs.length > 0 && playSong(songs[0], songs)}
          className="bg-green-500 text-black rounded-full p-4 hover:scale-105 transition shadow-xl"
        >
          <Play className="w-8 h-8 ml-1" fill="currentColor" />
        </button>
      </div>

      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold mb-6 mt-4">Songs</h2>
        <div className="space-y-1 mb-6">
          {songs.map((song: any, idx: number) => {
            const songImg = song.image?.[0]?.url || '/default-cover.png';
            const duration = song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '-:--';

            return (
              <div
                key={song.id + idx}
                onClick={() => playSong(song, songs)}
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

        {songs.length >= 5 && (
          <div className="flex justify-center mb-12">
            <button onClick={loadMoreSongs} disabled={loadingSongs} className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-gray-600 hover:border-white rounded-full px-6 py-2 transition disabled:opacity-50">
              {loadingSongs ? 'Loading...' : 'Load More Songs'}
            </button>
          </div>
        )}

        {albums.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-6">
              {albums.map((album: any, idx: number) => (
                <div key={album.id + idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <SongCard song={album} onPlay={() => {}} />
                </div>
              ))}
            </div>
            {albums.length >= 5 && (
              <div className="flex justify-center">
                <button onClick={loadMoreAlbums} disabled={loadingAlbums} className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-gray-600 hover:border-white rounded-full px-6 py-2 transition disabled:opacity-50">
                  {loadingAlbums ? 'Loading...' : 'Load More Albums'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

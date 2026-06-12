import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SongCardProps {
  song: any;
  onPlay: (song: any) => void;
}

export function SongCard({ song, onPlay }: SongCardProps) {
  const navigate = useNavigate();
  const imageUrl = song.image?.find((img: any) => img.quality === '500x500')?.url ||
                   song.image?.[0]?.url ||
                   '/default-cover.png';

  // Format duration if available
  const durationStr = song.duration ?
    `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '';

  const handleClick = (e: React.MouseEvent) => {
    // If clicking the play button overlay, just play it
    if ((e.target as HTMLElement).closest('.play-btn-overlay')) {
      onPlay(song);
      return;
    }

    if (song.type === 'album') {
      navigate(`/album/${song.id}`);
    } else if (song.type === 'playlist') {
      navigate(`/playlist/${song.id}`);
    } else if (song.type === 'artist') {
      navigate(`/artist/${song.id}`);
    } else if (song.type === 'song' || song.id) {
      // By default navigate to song page if it's a song, users can click the play overlay to play directly
      navigate(`/song/${song.id}`);
    } else {
      onPlay(song);
    }
  };

  return (
    <div
      className="group relative bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={song.title || 'Song Cover'}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center play-btn-overlay">
          <div className="bg-white text-black rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:scale-110">
            <Play fill="currentColor" className="w-6 h-6 ml-1" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg truncate text-white mb-1" dangerouslySetInnerHTML={{ __html: song.title }}></h3>
        <p className="text-sm text-gray-400 truncate mb-1" dangerouslySetInnerHTML={{ __html: song.primaryArtists || song.singers || song.description || 'Unknown Artist' }}></p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span className="truncate max-w-[70%]" dangerouslySetInnerHTML={{ __html: song.album || '' }}></span>
          <span>{durationStr}</span>
        </div>
      </div>
    </div>
  );
}

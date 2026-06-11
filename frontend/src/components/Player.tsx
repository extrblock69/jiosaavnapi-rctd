import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export function Player() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev } = usePlayer();

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.find((img: any) => img.quality === '150x150')?.url ||
                   currentSong.image?.[0]?.url ||
                   '/default-cover.png';

  return (
    <div className="bg-[#181818] border-t border-gray-800 text-white p-4 animate-fade-in-up shadow-2xl h-24 flex items-center">
      {/* We can use an interval to simulate progress visually, or pass progress from Context */}
      <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full cursor-pointer hidden">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `0%` }}
        />
      </div>

      <div className="w-full flex items-center justify-between px-4">
        {/* Song Info */}
        <div className="flex items-center space-x-4 w-1/3">
          <img src={imageUrl} alt={currentSong.title || currentSong.name} className="w-14 h-14 rounded-md object-cover" />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.title || currentSong.name || '' }}></h4>
            <p className="text-xs text-gray-400 truncate mt-1" dangerouslySetInnerHTML={{ __html: currentSong.subtitle || '' }}></p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center space-x-6">
            <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95 transition-transform">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white text-black rounded-full p-3 hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause fill="currentColor" className="w-5 h-5" /> : <Play fill="currentColor" className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95 transition-transform">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar visual only, accurate progress requires sync via global audio ref in context. This is left static per standard simple UI mockups or requires extended context syncing. */}
          <div className="flex items-center space-x-2 mt-2 w-full max-w-md">
            <span className="text-xs text-gray-400">0:00</span>
            <div className="h-1 bg-gray-700 flex-1 rounded-full group cursor-pointer relative">
               <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500 w-0"></div>
            </div>
            <span className="text-xs text-gray-400">0:00</span>
          </div>
        </div>

        {/* Extras */}
        <div className="flex items-center justify-end w-1/3 space-x-4 text-gray-400">
          <Volume2 className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export function Player() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, progress, duration, volume, seekTo, setVolume, queue } = usePlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.find((img: any) => img.quality === '150x150')?.url ||
                   currentSong.image?.[0]?.url ||
                   '/default-cover.png';

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    seekTo(percent * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  return (
    <>
      {showQueue && (
        <div className="absolute bottom-24 right-4 w-80 max-h-96 bg-[#181818] border border-gray-800 rounded-lg shadow-2xl overflow-y-auto p-4 animate-fade-in-up z-50">
          <h3 className="font-bold text-lg mb-4 text-white">Up Next</h3>
          {queue.length === 0 && <p className="text-gray-400 text-sm">Empty queue</p>}
          <div className="space-y-3">
            {queue.map((song, idx) => (
              <div key={idx} className={`flex items-center gap-3 ${currentSong.id === song.id ? 'opacity-100' : 'opacity-60'} hover:opacity-100 transition-opacity`}>
                <img src={song.image?.[0]?.url || '/default-cover.png'} className="w-10 h-10 rounded object-cover" />
                <div className="overflow-hidden">
                  <p className={`text-sm truncate ${currentSong.id === song.id ? 'text-green-500 font-bold' : 'text-white'}`} dangerouslySetInnerHTML={{ __html: song.title || song.name || '' }}></p>
                  <p className="text-xs text-gray-400 truncate" dangerouslySetInnerHTML={{ __html: song.subtitle || '' }}></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#181818]/95 backdrop-blur-md border-t border-gray-800 text-white p-4 animate-fade-in-up shadow-2xl h-24 flex items-center relative z-40">

        {/* Top edge progress bar for small screens */}
        <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full cursor-pointer md:hidden" onClick={handleSeek}>
          <div
            className="h-full bg-green-500 transition-all duration-100 ease-linear"
            style={{ width: `${(progress / duration) * 100 || 0}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between px-2 md:px-4">
          {/* Song Info */}
          <div className="flex items-center space-x-4 w-[30%] md:w-1/3 min-w-0">
            <img src={imageUrl} alt={currentSong.title || currentSong.name} className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover shadow-md" />
            <div className="overflow-hidden min-w-0">
              <h4 className="font-semibold text-sm md:text-base truncate hover:underline cursor-pointer" dangerouslySetInnerHTML={{ __html: currentSong.title || currentSong.name || '' }}></h4>
              <p className="text-xs text-gray-400 truncate mt-0.5 hover:underline cursor-pointer" dangerouslySetInnerHTML={{ __html: currentSong.subtitle || '' }}></p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center w-[40%] md:w-1/3 px-2">
            <div className="flex items-center space-x-4 md:space-x-6">
              <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95 transition-transform">
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white text-black rounded-full p-2.5 md:p-3 hover:scale-105 active:scale-95 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" /> : <Play fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />}
              </button>
              <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95 transition-transform">
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Desktop Progress bar */}
            <div className="hidden md:flex items-center space-x-2 mt-2 w-full max-w-md">
              <span className="text-xs text-gray-400 min-w-[35px] text-right">{formatTime(progress)}</span>
              <div
                className="h-1 bg-gray-700 flex-1 rounded-full group cursor-pointer relative py-2 -my-2 flex items-center"
                onClick={handleSeek}
              >
                 <div className="h-1 bg-gray-600 rounded-full w-full overflow-hidden">
                   <div
                     className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors relative"
                     style={{ width: `${(progress / duration) * 100 || 0}%` }}
                   ></div>
                 </div>
              </div>
              <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Extras */}
          <div className="flex items-center justify-end w-[30%] md:w-1/3 space-x-3 md:space-x-4 text-gray-400">
            <button onClick={() => setShowQueue(!showQueue)} className={`hover:text-white transition-colors ${showQueue ? 'text-green-500' : ''}`}>
               <ListMusic className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex items-center space-x-2 group">
              <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="hover:text-white transition-colors">
                {volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <div
                className="hidden md:flex w-24 h-1 bg-gray-700 rounded-full cursor-pointer py-2 -my-2 items-center"
                onClick={handleVolumeClick}
              >
                <div className="h-1 bg-gray-600 rounded-full w-full overflow-hidden">
                  <div
                    className="h-full bg-white group-hover:bg-green-500 rounded-full transition-colors"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

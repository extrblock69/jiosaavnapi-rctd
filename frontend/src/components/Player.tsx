import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PlayerProps {
  currentSong: any;
  streamUrl: string;
}

export function Player({ currentSong, streamUrl }: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (streamUrl && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Error playing audio:", err));
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progressPercent || 0);
    }
  };

  if (!currentSong) return null;

  const imageUrl = currentSong.image?.find((img: any) => img.quality === '150x150')?.url ||
                   currentSong.image?.[0]?.url ||
                   '/default-cover.png';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 text-white p-4 z-50 animate-fade-in-up">
      <audio
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full cursor-pointer">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Song Info */}
        <div className="flex items-center space-x-4 w-1/3">
          <img src={imageUrl} alt={currentSong.title} className="w-14 h-14 rounded-md object-cover" />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate" dangerouslySetInnerHTML={{ __html: currentSong.title }}></h4>
            <p className="text-xs text-gray-400 truncate mt-1" dangerouslySetInnerHTML={{ __html: currentSong.primaryArtists || currentSong.singers || '' }}></p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white text-black rounded-full p-3 hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause fill="currentColor" className="w-5 h-5" /> : <Play fill="currentColor" className="w-5 h-5 ml-0.5" />}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
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

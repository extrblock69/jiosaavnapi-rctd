import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export interface Song {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  image: { quality: string; url: string }[];
  downloadUrl?: { quality: string; url: string }[];
  url?: string;
  artists?: { primary?: any[], all?: any[] };
}

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  streamUrl: string;
  progress: number;
  duration: number;
  volume: number;
  playSong: (song: Song, newQueue?: Song[]) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  addToQueue: (song: Song) => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1);

  // Audio element ref (we manage it here to keep it global across routes)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use a ref to store the latest queue state to avoid stale closures in the event listener
  const stateRef = useRef({ queueIndex, queue, currentSong });

  useEffect(() => {
    stateRef.current = { queueIndex, queue, currentSong };
  }, [queueIndex, queue, currentSong]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = async () => {
        const { queueIndex, queue, currentSong } = stateRef.current;
        if (queueIndex < queue.length - 1) {
          const nextIdx = queueIndex + 1;
          setQueueIndex(nextIdx);
          loadAndPlay(queue[nextIdx]);
        } else if (currentSong) {
          const suggestions = await fetchSuggestions(currentSong.id);
          if (suggestions.length > 0) {
            const nextSong = suggestions[0];
            setQueue(prev => [...prev, ...suggestions]);
            setQueueIndex(queueIndex + 1);
            loadAndPlay(nextSong);
          } else {
            setIsPlaying(false);
          }
        }
      };
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const fetchStreamUrl = async (song: Song) => {
    try {
      const linkParam = song.url ? `link=${encodeURIComponent(song.url)}` : `ids=${song.id}`;
      const res = await fetch(`${API_BASE}/songs?${linkParam}`);
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const details = data.data[0];
        if (details.downloadUrl && details.downloadUrl.length > 0) {
          const hq = details.downloadUrl.find((d: any) => d.quality === '320kbps') || details.downloadUrl[details.downloadUrl.length - 1];
          return hq.url;
        }
      }
    } catch (e) {
      console.error('Failed to fetch stream URL', e);
    }
    return null;
  };

  const loadAndPlay = async (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    const url = await fetchStreamUrl(song);
    if (url) {
      setStreamUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback failed", e));
      }
    } else {
      console.error("No valid stream found, skipping to next.");
      playNext();
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue([song]);
      setQueueIndex(0);
    }
    loadAndPlay(song);
  };

  const fetchSuggestions = async (songId: string) => {
    try {
      const res = await fetch(`${API_BASE}/songs/${songId}/suggestions?limit=10`);
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    } catch (e) {
      console.error('Failed to fetch suggestions', e);
    }
    return [];
  };

  const playNext = async () => {
    if (queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      loadAndPlay(queue[nextIdx]);
    } else if (currentSong) {
      // Auto-play radio logic: Fetch suggestions when queue ends
      const suggestions = await fetchSuggestions(currentSong.id);
      if (suggestions.length > 0) {
        const nextSong = suggestions[0];
        setQueue(prev => [...prev, ...suggestions]);
        setQueueIndex(queueIndex + 1);
        loadAndPlay(nextSong);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const playPrev = () => {
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      loadAndPlay(queue[prevIdx]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !streamUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Playback failed", e));
    }
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolumeState(vol);
    }
  };

  // Sync state with audio element for UI (optional, can be expanded for progress bar)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  return (
    <PlayerContext.Provider value={{ currentSong, queue, isPlaying, streamUrl, progress, duration, volume, playSong, playNext, playPrev, togglePlay, addToQueue, seekTo, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
};

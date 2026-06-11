import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Player } from '../Player';
import { TestMode } from '../TestMode';
import { usePlayer } from '../../context/PlayerContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentSong, streamUrl } = usePlayer();

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      {/* TestMode tools overlay */}
      <TestMode />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-gradient-to-b from-gray-900 to-[#121212] overflow-y-auto">
        {/* We can add a topbar here later if needed (user profile, back/forward buttons) */}

        <div className="flex-1 pb-28">
          {children}
        </div>
      </main>

      {/* Global Fixed Player */}
      {currentSong && streamUrl && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Player />
        </div>
      )}
    </div>
  );
}

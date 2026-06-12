import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Album } from './pages/Album';
import { Playlist } from './pages/Playlist';
import { Artist } from './pages/Artist';
import { SongPage } from './pages/SongPage';
import { ApiTester } from './components/ApiTester';
import { Beaker } from 'lucide-react';

function App() {
  const [showApiTester, setShowApiTester] = useState<boolean>(false);

  if (showApiTester) {
    return <ApiTester onClose={() => setShowApiTester(false)} />;
  }

  return (
    <BrowserRouter>
      <div className="relative">
        <button
          onClick={() => setShowApiTester(true)}
          className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition flex items-center shadow-lg border border-gray-700 group z-[60]"
          title="Open API Tester Area"
        >
          <Beaker className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap px-0 group-hover:px-2 text-sm font-medium">
            API Tester
          </span>
        </button>

        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/playlist/:id" element={<Playlist />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/song/:id" element={<SongPage />} />
          </Routes>
        </MainLayout>
      </div>
    </BrowserRouter>
  );
}

export default App;

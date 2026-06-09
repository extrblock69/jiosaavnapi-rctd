import { Terminal, X } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function TestMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Arijit Singh');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting Full Diagnostic Test...');

    try {
      // 1. Verify API Connection
      addLog('Step 1: Verifying Backend Connection...');
      try {
        const pingUrl = `${API_BASE}/search?query=ping`;
        addLog(`[RAW REQ] GET ${pingUrl}`);
        const ping = await fetch(pingUrl);
        addLog(`[RAW RES] Status: ${ping.status}`);

        try {
          const pingData = await ping.json();
          addLog(`[RAW RES] Body: ${JSON.stringify(pingData, null, 2)}`);
        } catch (err) {
          addLog(`[RAW RES] Body: <Could not parse JSON>`);
        }

        if (ping.ok) addLog('✅ Backend connection successful!');
        else throw new Error('Backend returned non-200 status');
      } catch (e: any) {
        addLog(`❌ Backend connection failed: ${e.message}`);
        throw e;
      }

      // 2. Sample Search Flow
      const query = searchQuery.trim() || 'Arijit Singh';
      addLog(`Step 2: Searching for "${query}"...`);
      const searchUrl = `${API_BASE}/search/songs?query=${encodeURIComponent(query)}`;
      addLog(`[RAW REQ] GET ${searchUrl}`);
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      addLog(`[RAW RES] Status: ${searchRes.status}`);
      addLog(`[RAW RES] Body: ${JSON.stringify(searchData, null, 2)}`);

      if (!searchData.success || !searchData.data || searchData.data.results?.length === 0) {
        addLog('❌ No search results found or invalid response structure.');
        throw new Error('Search failed');
      }

      const firstSong = searchData.data.results[0];
      addLog(`✅ Search successful. Found ${searchData.data.results.length} results.`);
      addLog(`🎵 Picked first song: "${firstSong.title}" (ID: ${firstSong.id})`);

      // 3. Song Object Structure
      addLog('Step 3: Inspecting song object structure...');
      addLog(`- ID: ${firstSong.id}`);
      addLog(`- Title: ${firstSong.title}`);
      addLog(`- Has Images: ${!!firstSong.image?.length}`);
      addLog(`- Has URL: ${!!firstSong.url}`);

      // 4. Stream URL Generation
      addLog('Step 4: Fetching stream URL...');
      const linkParam = firstSong.url ? `link=${encodeURIComponent(firstSong.url)}` : `ids=${firstSong.id}`;
      const streamUrl = `${API_BASE}/songs?${linkParam}`;
      addLog(`[RAW REQ] GET ${streamUrl}`);
      const songRes = await fetch(streamUrl);
      const songData = await songRes.json();

      addLog(`[RAW RES] Status: ${songRes.status}`);
      addLog(`[RAW RES] Body: ${JSON.stringify(songData, null, 2)}`);

      if (!songData.success || !songData.data || songData.data.length === 0) {
        addLog('❌ Failed to fetch detailed song stream data.');
        throw new Error('Stream fetch failed');
      }

      const songDetails = songData.data[0];
      if (songDetails.downloadUrl && songDetails.downloadUrl.length > 0) {
        const highestQuality = songDetails.downloadUrl[songDetails.downloadUrl.length - 1];
        addLog(`✅ Stream URL Generation Process Successful.`);
        addLog(`🎶 Acquired Stream URL: ${highestQuality.url}`);
        addLog(`🔊 Quality: ${highestQuality.quality}`);
      } else {
        addLog('❌ No downloadUrl array found on the song details.');
        throw new Error('No stream URL');
      }

      addLog('🎉 Diagnostic completed successfully! Everything is working correctly.');

    } catch (error: any) {
      addLog(`⛔ Diagnostic aborted due to error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors z-40 group flex items-center shadow-lg border border-gray-700"
        title="Test Mode Diagnostic"
      >
        <Terminal className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap px-0 group-hover:px-2 text-sm font-medium">
          Test Mode
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111] border border-gray-700 rounded-xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h3 className="font-mono font-bold text-lg">System Diagnostics</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-sm text-green-400">
              {logs.length === 0 && !isRunning && (
                <div className="text-gray-500 h-full flex items-center justify-center">
                  Click 'Run Diagnostics' to start testing system functionality.
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="mb-2 whitespace-pre-wrap">{log}</div>
              ))}
              {isRunning && (
                <div className="animate-pulse flex items-center space-x-2 mt-4 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-400 text-sm font-medium">Search Keyword:</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isRunning}
                  className="bg-black border border-gray-700 text-white px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-gray-500 w-full sm:w-64"
                  placeholder="e.g. Arijit Singh"
                />
              </div>
              <button
                onClick={runDiagnostic}
                disabled={isRunning}
                className="bg-white text-black px-6 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isRunning ? 'Running...' : 'Run Diagnostics'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

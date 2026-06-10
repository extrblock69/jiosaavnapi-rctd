import React, { useState } from 'react';
import { Terminal, Send, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

type EndpointDef = {
  name: string;
  path: string;
  params: { name: string; type: 'string' | 'number'; required: boolean; default?: string }[];
};

const ENDPOINTS: EndpointDef[] = [
  { name: 'Search All', path: '/search', params: [{ name: 'query', type: 'string', required: true }] },
  { name: 'Search Songs', path: '/search/songs', params: [{ name: 'query', type: 'string', required: true }, { name: 'page', type: 'number', required: false, default: '0' }, { name: 'limit', type: 'number', required: false, default: '10' }] },
  { name: 'Search Albums', path: '/search/albums', params: [{ name: 'query', type: 'string', required: true }, { name: 'page', type: 'number', required: false, default: '0' }, { name: 'limit', type: 'number', required: false, default: '10' }] },
  { name: 'Search Artists', path: '/search/artists', params: [{ name: 'query', type: 'string', required: true }, { name: 'page', type: 'number', required: false, default: '0' }, { name: 'limit', type: 'number', required: false, default: '10' }] },
  { name: 'Search Playlists', path: '/search/playlists', params: [{ name: 'query', type: 'string', required: true }, { name: 'page', type: 'number', required: false, default: '0' }, { name: 'limit', type: 'number', required: false, default: '10' }] },
  { name: 'Get Song (Query)', path: '/songs', params: [{ name: 'ids', type: 'string', required: false }, { name: 'link', type: 'string', required: false }] },
  { name: 'Get Song (Path)', path: '/songs/:id', params: [{ name: 'id', type: 'string', required: true }] },
  { name: 'Song Suggestions', path: '/songs/:id/suggestions', params: [{ name: 'id', type: 'string', required: true }, { name: 'limit', type: 'number', required: false, default: '10' }] },
  { name: 'Song Station', path: '/songs/:id/station', params: [{ name: 'id', type: 'string', required: true }] },
  { name: 'Get Album (Query)', path: '/albums', params: [{ name: 'id', type: 'string', required: false }, { name: 'link', type: 'string', required: false }] },
  { name: 'Get Album (Path)', path: '/albums/:id', params: [{ name: 'id', type: 'string', required: true }] },
  { name: 'Get Playlist (Query)', path: '/playlists', params: [{ name: 'id', type: 'string', required: false }, { name: 'link', type: 'string', required: false }, { name: 'page', type: 'number', required: false }, { name: 'limit', type: 'number', required: false }] },
  { name: 'Get Playlist (Path)', path: '/playlists/:id', params: [{ name: 'id', type: 'string', required: true }, { name: 'page', type: 'number', required: false }, { name: 'limit', type: 'number', required: false }] },
  { name: 'Get Artist (Query)', path: '/artists', params: [{ name: 'id', type: 'string', required: false }, { name: 'link', type: 'string', required: false }, { name: 'page', type: 'number', required: false }, { name: 'songCount', type: 'number', required: false }, { name: 'albumCount', type: 'number', required: false }, { name: 'sortBy', type: 'string', required: false }, { name: 'sortOrder', type: 'string', required: false }] },
  { name: 'Get Artist (Path)', path: '/artists/:id', params: [{ name: 'id', type: 'string', required: true }, { name: 'page', type: 'number', required: false }, { name: 'songCount', type: 'number', required: false }, { name: 'albumCount', type: 'number', required: false }, { name: 'sortBy', type: 'string', required: false }, { name: 'sortOrder', type: 'string', required: false }] },
  { name: 'Get Artist Songs', path: '/artists/:id/songs', params: [{ name: 'id', type: 'string', required: true }, { name: 'page', type: 'number', required: false }, { name: 'sortBy', type: 'string', required: false }, { name: 'sortOrder', type: 'string', required: false }] },
  { name: 'Get Artist Albums', path: '/artists/:id/albums', params: [{ name: 'id', type: 'string', required: true }, { name: 'page', type: 'number', required: false }, { name: 'sortBy', type: 'string', required: false }, { name: 'sortOrder', type: 'string', required: false }] },
];

interface ApiTesterProps {
  onClose: () => void;
}

export function ApiTester({ onClose }: ApiTesterProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedEndpoint = ENDPOINTS[selectedIndex];

  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndex(Number(e.target.value));
    setParamValues({});
    setLogs([]);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setLogs([]);

    let finalPath = selectedEndpoint.path;
    const queryParams = new URLSearchParams();

    // Process parameters
    selectedEndpoint.params.forEach(param => {
      const val = paramValues[param.name] || param.default;
      if (!val) return;

      if (finalPath.includes(`:${param.name}`)) {
        finalPath = finalPath.replace(`:${param.name}`, encodeURIComponent(val));
      } else {
        queryParams.append(param.name, val);
      }
    });

    const queryString = queryParams.toString();
    const fullUrl = `${API_BASE}${finalPath}${queryString ? `?${queryString}` : ''}`;

    addLog(`🚀 Executing Test: ${selectedEndpoint.name}`);
    addLog(`[RAW REQ] GET ${fullUrl}`);

    try {
      const startTime = Date.now();
      const res = await fetch(fullUrl);
      const endTime = Date.now();

      addLog(`[RAW RES] Status: ${res.status} ${res.statusText} (${endTime - startTime}ms)`);

      let data;
      try {
        data = await res.json();
        addLog(`[RAW RES] Body: \n${JSON.stringify(data, null, 2)}`);
      } catch (err) {
        const text = await res.text();
        addLog(`[RAW RES] Body (Text): \n${text}`);
      }
    } catch (error: any) {
      addLog(`❌ Network Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 absolute inset-0 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

        {/* Left Sidebar: Controls */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
            <button onClick={onClose} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Terminal className="text-green-400" />
                API Tester Area
              </h2>
              <p className="text-gray-400 text-sm mt-1">Execute and monitor raw endpoints</p>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-5 shadow-lg">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Select Endpoint</label>
            <select
              className="w-full bg-black border border-gray-700 rounded-md p-2.5 text-sm focus:border-green-500 focus:outline-none mb-6"
              value={selectedIndex}
              onChange={handleEndpointChange}
            >
              {ENDPOINTS.map((ep, idx) => (
                <option key={ep.name} value={idx}>{ep.name} ({ep.path})</option>
              ))}
            </select>

            {selectedEndpoint.params.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 border-b border-gray-800 pb-2">Parameters</h3>
                {selectedEndpoint.params.map(param => (
                  <div key={param.name}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {param.name} {param.required && <span className="text-red-500">*</span>}
                      {param.default && <span className="text-gray-600 ml-1">(default: {param.default})</span>}
                    </label>
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      className="w-full bg-black border border-gray-700 rounded-md p-2 text-sm focus:border-green-500 focus:outline-none"
                      placeholder={`Enter ${param.name}`}
                      value={paramValues[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={executeRequest}
              disabled={isLoading}
              className="mt-6 w-full bg-white text-black font-bold py-2.5 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Executing...' : 'Send Request'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Logs */}
        <div className="w-full md:w-2/3 flex flex-col h-[85vh]">
          <div className="bg-[#111] border border-gray-800 rounded-t-xl p-3 flex items-center justify-between">
            <span className="font-mono text-sm text-green-400">Terminal Output</span>
            <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-white">Clear</button>
          </div>
          <div className="flex-1 bg-black border border-t-0 border-gray-800 rounded-b-xl p-4 overflow-y-auto font-mono text-xs sm:text-sm text-green-400 shadow-inner">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-600 italic">
                Ready to send requests...
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="mb-3 whitespace-pre-wrap leading-relaxed break-words">{log}</div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

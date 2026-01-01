
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  Globe, 
  Terminal, 
  AlertTriangle, 
  ShieldAlert, 
  Loader, 
  ExternalLink, 
  Radio, 
  Activity,
  CheckCircle,
  Database
} from 'lucide-react';

const SocialScraper = () => {
  const [query, setQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsScanning(true);
    setLogs([]);
    setResults(null);
    setError(null);

    try {
      addLog(`Initializing OSINT protocol for target: "${query}"...`);
      addLog("Connecting to Secure Intelligence Gateway...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      addLog("Deploying search spiders to public index...");
      
      const prompt = `
        Act as an OSINT (Open Source Intelligence) analyst. 
        Search the live web for the latest information regarding: "${query}".
        
        Focus on:
        1. Recent public social media discussions or news reports.
        2. Verify if this is an active incident or rumor.
        3. Identify specific locations and timestamps mentioned.
        4. Assess public sentiment (Panic, Anger, Calm).

        Provide a structured situation report.
      `;

      addLog("Aggregating signals from distributed nodes...");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      addLog("Raw data captured. Processing grounding metadata...");

      // Extract Grounding Metadata (The "Scraped" Links)
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => chunk.web);

      addLog(`Identified ${webSources.length} relevant data sources.`);
      addLog("Synthesizing intelligence report...");

      setResults({
        text: response.text,
        sources: webSources
      });

      addLog("Scan complete. Displaying intelligence.");

    } catch (err: any) {
      console.error(err);
      setError("Gateway Timeout or API Error. Ensure API Key supports Search Grounding.");
      addLog("ERROR: Connection terminated.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
          <Radio className="text-red-600 animate-pulse" /> Live OSINT Scanner
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Real-time extraction of public web data and social signals using Google Search Grounding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
              <Search size={18} /> Target Definition
            </h3>
            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keywords / Hashtags / Location</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 'Protest in Connaught Place'"
                    className="w-full pl-4 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-navy-500 outline-none text-slate-900 dark:text-white"
                  />
                  {isScanning && (
                    <div className="absolute right-3 top-3">
                      <Loader size={18} className="animate-spin text-navy-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isScanning || !query}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? 'Scanning Network...' : 'Initiate Live Scan'}
                {!isScanning && <Globe size={18} />}
              </button>
            </form>
          </div>

          {/* Terminal Logs */}
          <div className="flex-1 bg-black rounded-xl border border-slate-700 p-4 font-mono text-xs overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 text-green-500 mb-2 border-b border-green-900/30 pb-2">
              <Terminal size={14} /> 
              <span className="uppercase tracking-wider">System Terminal</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-green-400/80 custom-scrollbar">
              {logs.length === 0 && <span className="opacity-50">System Idle. Waiting for target...</span>}
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
              {isScanning && (
                <div className="animate-pulse">_</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Intelligence Feed
            </h3>
            {results && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={10} /> Live Data
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {results ? (
              <div className="space-y-8">
                
                {/* 1. Synthesis */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert size={14} /> Situation Report (AI Synthesized)
                  </h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                      {results.text}
                    </div>
                  </div>
                </div>

                {/* 2. Source Signals */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Database size={14} /> Intercepted Signals (Sources)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.sources && results.sources.length > 0 ? (
                      results.sources.map((source: any, idx: number) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex flex-col p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-white dark:bg-slate-800 hover:shadow-sm group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[70%]">
                              {new URL(source.uri).hostname.replace('www.', '')}
                            </span>
                            <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-500" />
                          </div>
                          <h5 className="font-bold text-sm text-navy-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {source.title}
                          </h5>
                        </a>
                      ))
                    ) : (
                      <div className="col-span-full p-4 text-center text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-900 rounded">
                        No direct source links provided in grounding metadata. Refer to synthesis.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                {isScanning ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <Globe size={48} className="mb-4 text-blue-200 dark:text-slate-700" />
                    <p>Scraping live web nodes...</p>
                  </div>
                ) : (
                  <>
                    <Globe size={48} className="mb-4 opacity-20" />
                    <p>Enter a target to begin live extraction.</p>
                  </>
                )}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                <AlertTriangle size={20} />
                <div>
                  <span className="font-bold block">Scan Failed</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialScraper;


import React, { useState, useEffect } from 'react';
import { Twitter, Facebook, Globe, AlertOctagon, MessageCircle, Search, Activity, BarChart2, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LineChart, Line, CartesianGrid, YAxis } from 'recharts';

// Fallback Mock Data if backend is unreachable
const MOCK_INSIGHTS = {
  trending: [
    { name: 'Riot', count: 45 },
    { name: 'Protest', count: 120 },
    { name: 'Traffic', count: 89 },
    { name: 'Fire', count: 32 },
    { name: 'Police', count: 210 },
  ],
  timeline: [
    { time: '08:00', volume: 12 },
    { time: '10:00', volume: 45 },
    { time: '12:00', volume: 156 },
    { time: '14:00', volume: 89 },
    { time: '16:00', volume: 67 },
    { time: '18:00', volume: 130 },
  ],
  posts: [
    { id: '1', source: 'Twitter', user: '@anon_user99', text: 'Something big happening near the old market tomorrow #protest', sentiment: 'Negative', risk: 'High', timestamp: '10m ago' },
    { id: '2', source: 'Telegram', user: 'Group: Local Updates', text: 'Police barricades set up at Sector 44. Avoid the route.', sentiment: 'Neutral', risk: 'Low', timestamp: '15m ago' },
    { id: '3', source: 'Facebook', user: 'City News Page', text: 'Breaking: Cyber attack reported on local grid.', sentiment: 'Negative', risk: 'Critical', timestamp: '30m ago' },
  ],
  summary: { status: 'Spike Detected', color: 'red', details: 'Unusual volume detected in last 2 hours.' }
};

const SentimentAnalysis = () => {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any>(MOCK_INSIGHTS);
  const [loading, setLoading] = useState(false);

  // Function to simulate or fetch data
  const fetchData = async (searchQuery: string) => {
    setLoading(true);
    try {
      // In a real scenario, this connects to the backend endpoint we just made.
      // For this demo component to be robust without a running server, we simulate the logic:
      const res = await fetch(`http://localhost:5000/api/osint/insights?q=${searchQuery}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Fallback simulation logic for demo if server is offline
        const filteredPosts = MOCK_INSIGHTS.posts.filter(p => 
            p.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
            searchQuery === ''
        );
        setData({
            ...MOCK_INSIGHTS,
            posts: filteredPosts,
            summary: searchQuery && filteredPosts.length === 0 ? { status: "No Data", color: "gray", details: "No matches found." } : MOCK_INSIGHTS.summary
        });
      }
    } catch (e) {
      console.warn("Backend unavailable, using mock data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(query);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
             <Globe className="text-blue-500" /> Social Media Intelligence (OSINT)
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             Real-time analysis of public posts for threat detection and situational awareness.
           </p>
        </div>
        
        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
                type="text" 
                placeholder="Search keywords or locations..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Insight Summary Card */}
        <div className={`lg:col-span-1 p-6 rounded-lg border shadow-sm flex flex-col justify-center text-center ${
            data.summary.color === 'red' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 
            data.summary.color === 'gray' ? 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700' :
            'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
        }`}>
           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Insight Summary</h4>
           <div className={`text-2xl font-black mb-2 ${
               data.summary.color === 'red' ? 'text-red-600' : 
               data.summary.color === 'gray' ? 'text-slate-600' :
               'text-emerald-600'
           }`}>
               {loading ? 'Analyzing...' : data.summary.status}
           </div>
           <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
               {data.summary.details}
           </p>
           {data.summary.color === 'red' && (
               <div className="mt-4 flex items-center justify-center gap-1 text-red-600 font-bold text-xs animate-pulse">
                   <AlertTriangle size={14} /> Attention Required
               </div>
           )}
        </div>

        {/* Time-Based Spike Graph */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
           <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 text-sm">
             <Activity size={16} className="text-navy-500" /> Volume Timeline (Last 24h)
           </h4>
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.timeline}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="time" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                 <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                 />
                 <Line type="monotone" dataKey="volume" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Trending Keywords */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
           <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2 text-sm">
             <TrendingUp size={16} className="text-blue-500" /> Trending Topics
           </h4>
           <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.trending} layout="vertical" margin={{top: 0, right: 30, left: 20, bottom: 0}}>
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={80} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                 <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[280px]">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between bg-slate-50 dark:bg-slate-900 rounded-t-lg">
              <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2 text-sm">
                <MessageSquare size={16} /> Live Post Stream
              </h4>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">Simulated Data</span>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
             {data.posts.map((post: any, i: number) => (
               <div key={i} className="p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                       <div className="mt-1">
                         {post.source === 'Twitter' ? <Twitter size={16} className="text-blue-400" /> : 
                          post.source === 'Facebook' ? <Facebook size={16} className="text-blue-700" /> : 
                          <Globe size={16} className="text-slate-400" />}
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{post.user} • {post.timestamp}</p>
                         <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">{post.text}</p>
                         {post.location && (
                             <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                 <AlertOctagon size={10} /> {post.location}
                             </span>
                         )}
                       </div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      post.risk === 'Critical' || post.risk === 'High' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20' :
                      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {post.risk}
                    </span>
                  </div>
               </div>
             ))}
             {data.posts.length === 0 && (
                 <div className="p-8 text-center text-slate-400 text-xs">No posts found matching criteria.</div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default SentimentAnalysis;

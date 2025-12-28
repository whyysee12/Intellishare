import React from 'react';
import { Twitter, Facebook, Globe, AlertOctagon, MessageCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const sentimentData = [
  { name: 'Riot', count: 45 },
  { name: 'Protest', count: 120 },
  { name: 'Attack', count: 32 },
  { name: 'Scam', count: 89 },
  { name: 'Police', count: 210 },
];

const SentimentAnalysis = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Social Sentiment & Threat Monitoring</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Real-time OSINT scanning for public unrest and threats.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Threat Meter */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center">
           <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-4">Current Threat Level</h4>
           <div className="relative w-48 h-24 overflow-hidden mx-auto mb-4">
             <div className="absolute top-0 left-0 w-full h-full bg-slate-200 dark:bg-slate-700 rounded-t-full"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-t-full opacity-30"></div>
             {/* Needle */}
             <div className="absolute bottom-0 left-1/2 w-1 h-full bg-slate-800 dark:bg-white origin-bottom transform -rotate-45 transition-transform duration-1000"></div>
           </div>
           <div className="text-3xl font-black text-amber-500">MODERATE</div>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Elevated chatter regarding "Protest" in Central District.</p>
        </div>

        {/* Keyword Cloud (Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
           <h4 className="font-bold text-slate-600 dark:text-slate-300 mb-4">Trending Threat Keywords (Last 24h)</h4>
           <div className="h-40">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={sentimentData}>
                 <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                 <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                 />
                 <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between">
              <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Globe size={18} /> OSINT Live Feed
              </h4>
              <button className="text-xs text-navy-600 dark:text-blue-400 font-bold hover:underline">Configure Sources</button>
           </div>
           <div className="divide-y divide-slate-100 dark:divide-slate-700">
             {[
               { source: 'Twitter', user: '@anon_user99', text: 'Something big happening near the old market tomorrow #protest', sentiment: 'Negative', risk: 'High', icon: Twitter, color: 'text-blue-400' },
               { source: 'Telegram', user: 'Group: Local Updates', text: 'Police barricades set up at Sector 44. Avoid the route.', sentiment: 'Neutral', risk: 'Low', icon: MessageCircle, color: 'text-sky-500' },
               { source: 'Facebook', user: 'City News Page', text: 'Breaking: Cyber attack reported on local grid.', sentiment: 'Negative', risk: 'Critical', icon: Facebook, color: 'text-blue-700' },
             ].map((post, i) => (
               <div key={i} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                       <div className="mt-1">
                         <post.icon size={20} className={post.color} />
                       </div>
                       <div>
                         <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{post.user} • 10m ago</p>
                         <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">{post.text}</p>
                       </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                      post.risk === 'Critical' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20' :
                      post.risk === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20' :
                      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {post.risk} Risk
                    </span>
                  </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default SentimentAnalysis;
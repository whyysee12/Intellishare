import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import NetworkGraph from './NetworkGraph';
import { Share2, FileText, Info } from 'lucide-react';

const data = [
  { name: 'Jan', Theft: 40, Cyber: 24, Narcotics: 10 },
  { name: 'Feb', Theft: 30, Cyber: 13, Narcotics: 22 },
  { name: 'Mar', Theft: 20, Cyber: 58, Narcotics: 12 },
  { name: 'Apr', Theft: 27, Cyber: 39, Narcotics: 20 },
  { name: 'May', Theft: 18, Cyber: 48, Narcotics: 21 },
  { name: 'Jun', Theft: 23, Cyber: 38, Narcotics: 25 },
  { name: 'Jul', Theft: 34, Cyber: 43, Narcotics: 21 },
];

const PatternDetection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Crime Pattern Identification</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Temporal trend analysis and modus operandi clustering.</p>
        </div>
        <button className="text-xs font-bold text-navy-600 dark:text-blue-400 border border-navy-200 dark:border-slate-600 px-3 py-1.5 rounded hover:bg-navy-50 dark:hover:bg-slate-700 transition">
           Export Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
            <FileText size={18} /> 6-Month Crime Trend Analysis
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTheft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCyber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={{stroke: '#e2e8f0'}} />
                <YAxis tick={{fill: '#94a3b8'}} axisLine={{stroke: '#e2e8f0'}} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="Theft" stroke="#8884d8" fillOpacity={1} fill="url(#colorTheft)" />
                <Area type="monotone" dataKey="Cyber" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCyber)" />
                <Area type="monotone" dataKey="Narcotics" stroke="#ffc658" fillOpacity={0.6} fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pattern Insights */}
        <div className="space-y-4">
           <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
             <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase">Emerging Modus Operandi</h4>
             <ul className="space-y-3">
               <li className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r">
                 <p className="text-xs font-bold text-red-700 dark:text-red-400">Cyber-Financial Fraud</p>
                 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                   Pattern Match: 94%. Spike in UPI phishing calls originating from Jamtara region between 18:00-21:00.
                 </p>
               </li>
               <li className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r">
                 <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Vehicle Theft</p>
                 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                   Pattern Match: 82%. SUV thefts in North Delhi targeting keyless entry systems.
                 </p>
               </li>
             </ul>
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900 text-sm">
              <div className="flex gap-2 items-start text-blue-800 dark:text-blue-300">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>AI suggests investigating the correlation between Cybercrime spikes and weekend holidays (Correlation coeff: 0.85).</p>
              </div>
           </div>
        </div>
      </div>

      {/* Network Graph Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
           <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
             <Share2 size={18} /> Criminal Network Visualization
           </h4>
        </div>
        <div className="p-1">
           <NetworkGraph />
        </div>
      </div>
    </div>
  );
};

export default PatternDetection;
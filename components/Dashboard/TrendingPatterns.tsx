import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const TrendingPatterns = () => {
  const patterns = [
    { name: 'Vehicle Theft Ring - North Zone', confidence: 94, trend: 'up', risk: 'High' },
    { name: 'Cyber Phishing Pattern #44', confidence: 88, trend: 'up', risk: 'High' },
    { name: 'ATM Fraud - Weekend Pattern', confidence: 76, trend: 'stable', risk: 'Medium' },
    { name: 'Narcotics Transit - Highway 8', confidence: 72, trend: 'down', risk: 'Medium' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wide">Emerging Patterns (AI Detected)</h3>
        <span className="text-[10px] bg-navy-100 text-navy-700 px-2 py-1 rounded-full font-bold">4 New</span>
      </div>
      <div className="p-4 space-y-3">
        {patterns.map((pattern, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 hover:border-navy-300 transition-colors cursor-pointer group">
            <div>
              <div className="font-bold text-sm text-navy-900 group-hover:text-navy-700">{pattern.name}</div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Confidence Score: <span className="font-mono font-medium text-navy-700">{pattern.confidence}%</span></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {pattern.risk === 'High' && (
                 <span className="text-[10px] font-bold text-red-700 flex items-center bg-red-50 px-2 py-1 rounded border border-red-100">
                   <ArrowUpRight size={10} className="mr-1" /> High Risk
                 </span>
               )}
               <button className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-navy-50 hover:text-navy-800 hover:border-navy-200 transition-colors">
                 Analyze
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPatterns;
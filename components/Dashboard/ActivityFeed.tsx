import React from 'react';
import { ActivityLog } from '../../types';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const ActivityIndicator = () => (
  <span className="flex h-2 w-2 relative">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
  </span>
);

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
         <h3 className="font-bold text-navy-900 text-sm uppercase tracking-wide">Recent Intel Activity</h3>
         <ActivityIndicator />
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 space-y-0 max-h-[400px]">
        {activities.map((log) => (
          <div key={log.id} className="flex gap-3 items-start p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <div className={`mt-1 min-w-[8px] h-2 rounded-full ${
              log.type === 'alert' ? 'bg-red-500' : 
              log.type === 'warning' ? 'bg-orange-500' : 'bg-navy-500'
            }`} />
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{log.action}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                <span className="font-medium">{log.user}</span>
                <span className="text-slate-300">•</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50 mt-auto">
         <button className="text-navy-700 text-xs font-bold w-full text-center hover:bg-slate-200 py-2 rounded uppercase tracking-wider transition-colors">
           View Full System Log
         </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
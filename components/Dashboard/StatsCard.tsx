import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  alert?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtext, icon: Icon, alert = false }) => {
  return (
    <div className={`p-5 rounded-lg border transition-all hover:shadow-md ${
      alert 
        ? 'bg-red-50 border-red-200' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className={`text-2xl font-bold mt-2 ${alert ? 'text-red-700' : 'text-navy-900'}`}>{value}</h3>
        </div>
        <div className={`p-2 rounded-md ${alert ? 'bg-red-100 text-red-700' : 'bg-navy-50 text-navy-700'}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs border-t border-slate-100 pt-3">
        {alert ? (
           <span className="text-red-700 font-semibold flex items-center">
             <AlertTriangle size={12} className="mr-1" /> Attention required
           </span>
        ) : (
          <span className="text-emerald-700 font-semibold flex items-center">
            <TrendingUp size={12} className="mr-1" /> {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
import React from 'react';
import { MapPin, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

const PredictiveAnalytics = () => {
  const hotspots = [
    { location: 'Sector 18, Noida', probability: 89, type: 'Vehicle Theft', time: '18:00 - 22:00' },
    { location: 'Connaught Place, Delhi', probability: 76, type: 'Pickpocketing', time: '14:00 - 16:00' },
    { location: 'Indiranagar, Bangalore', probability: 65, type: 'Burglary', time: '02:00 - 04:00' },
    { location: 'Andheri East, Mumbai', probability: 62, type: 'Narcotics', time: '22:00 - 01:00' },
  ];

  const anomalies = [
    { id: 1, title: 'Unusual Financial Velocity', score: 9.2, desc: 'Account X transferred ₹50L to 14 distinct accounts within 10 mins.', status: 'Critical' },
    { id: 2, title: 'Geospatial Jump', score: 8.5, desc: 'Suspect phone detected in Delhi and Mumbai towers within 30 mins.', status: 'High' },
    { id: 3, title: 'Communication Spike', score: 7.1, desc: 'Dormant number +91-98xxx activated with 200 outgoing calls.', status: 'Medium' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Predictive Intelligence</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">AI-forecasted crime hotspots and behavioral anomaly detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Hotspot Prediction */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <MapPin size={18} className="text-red-500" /> 
              Next 24h Hotspot Forecast
            </h4>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded font-bold">
              92% Historical Accuracy
            </span>
          </div>
          
          <div className="p-5 space-y-4">
            {hotspots.map((spot, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">{spot.location}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{spot.type} • {spot.time}</span>
                  </div>
                  <span className={`text-sm font-bold ${spot.probability > 80 ? 'text-red-600' : 'text-orange-500'}`}>
                    {spot.probability}% Risk
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${spot.probability > 80 ? 'bg-red-500' : 'bg-orange-500'}`} 
                    style={{ width: `${spot.probability}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
            <button className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-bold text-navy-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              View Deployment Recommendations
            </button>
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700">
            <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> 
              Real-time Anomalies
            </h4>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                   <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{anomaly.title}</h5>
                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                     anomaly.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                     anomaly.status === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                     'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                   }`}>
                     {anomaly.status}
                   </span>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{anomaly.desc}</p>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                     <AlertTriangle size={12} /> Score: {anomaly.score}/10
                   </div>
                   <button className="text-xs text-navy-600 dark:text-blue-400 font-bold hover:underline">
                     Investigate
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PredictiveAnalytics;
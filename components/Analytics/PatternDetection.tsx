import React, { useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import NetworkGraph from './NetworkGraph';
import { Share2, FileText, Info, MapPin, AlertCircle } from 'lucide-react';
import { Case } from '../../types';
import * as L from 'leaflet';

interface Props {
  caseData?: Case | null;
}

const PatternDetection: React.FC<Props> = ({ caseData }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  
  // Generate dynamic data based on the specific case type if available
  const data = useMemo(() => {
    const baseData = [
      { name: 'Jan', Theft: 40, Cyber: 24, Narcotics: 10 },
      { name: 'Feb', Theft: 30, Cyber: 13, Narcotics: 22 },
      { name: 'Mar', Theft: 20, Cyber: 58, Narcotics: 12 },
      { name: 'Apr', Theft: 27, Cyber: 39, Narcotics: 20 },
      { name: 'May', Theft: 18, Cyber: 48, Narcotics: 21 },
      { name: 'Jun', Theft: 23, Cyber: 38, Narcotics: 25 },
      { name: 'Jul', Theft: 34, Cyber: 43, Narcotics: 21 },
    ];

    if (!caseData) return baseData;

    // Modify data to reflect a spike in the relevant crime type for the specific case
    return baseData.map(item => {
      let newItem = { ...item };
      const spikeFactor = Math.floor(Math.random() * 40) + 30; // 30-70 increase
      
      if (caseData.type === 'Theft' || caseData.type === 'Burglary') {
        newItem.Theft += spikeFactor;
      } else if (caseData.type === 'Cybercrime' || caseData.type === 'Fraud') {
        newItem.Cyber += spikeFactor;
      } else if (caseData.type === 'Drug Trafficking' || caseData.type === 'Narcotics') {
        newItem.Narcotics += spikeFactor;
      }
      return newItem;
    });
  }, [caseData]);

  // Initialize Leaflet Map for Geospatial Cluster
  useEffect(() => {
    // Only initialize if we have a container and caseData (for specific location)
    if (mapContainer.current && caseData) {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        const { lat, lng } = caseData.location;
        const map = L.map(mapContainer.current).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Custom Icons
        const redIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-md"></div>`
        });
        
        const mainIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="relative"><div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div><div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div></div>`
        });

        // Add Cluster Circle
        L.circle([lat, lng], {
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2,
            radius: 800
        }).addTo(map);

        // Add Main Marker
        L.marker([lat, lng], { icon: mainIcon }).addTo(map)
            .bindPopup(`<div class="text-center font-bold text-navy-900">Pattern Epicenter<br/><span class="text-xs text-slate-500">${caseData.type} Cluster Origin</span></div>`)
            .openPopup();

        // Add Nearby Random Incidents (Simulated)
        for(let i=0; i<5; i++) {
            const rLat = lat + (Math.random() * 0.01 - 0.005);
            const rLng = lng + (Math.random() * 0.01 - 0.005);
            L.marker([rLat, rLng], { icon: redIcon }).addTo(map)
             .bindPopup(`<span class="text-xs font-bold">Linked Incident #${i+1}</span>`);
        }

        mapInstance.current = map;
    }

    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, [caseData]);

  const primaryTrend = caseData?.type || 'General Crime';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Crime Pattern Identification</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             {caseData ? `Analysis focused on ${caseData.type} patterns in ${caseData.location.city}.` : 'Temporal trend analysis and modus operandi clustering.'}
           </p>
        </div>
        <button className="text-xs font-bold text-navy-600 dark:text-blue-400 border border-navy-200 dark:border-slate-600 px-3 py-1.5 rounded hover:bg-navy-50 dark:hover:bg-slate-700 transition">
           Export Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
            <FileText size={18} /> {primaryTrend} Trend Analysis (6-Month)
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
               {caseData?.type === 'Drug Trafficking' || caseData?.type === 'Narcotics' ? (
                 <li className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r">
                   <p className="text-xs font-bold text-red-700 dark:text-red-400">Narcotics Supply Chain</p>
                   <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                     Pattern Match: 98%. Correlation detected with interstate transport routes in {caseData.location.city} sector.
                   </p>
                 </li>
               ) : (
                 <li className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r">
                   <p className="text-xs font-bold text-red-700 dark:text-red-400">Cyber-Financial Fraud</p>
                   <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                     Pattern Match: 94%. Spike in phishing calls detected in region.
                   </p>
                 </li>
               )}
               
               <li className="p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r">
                 <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                   {caseData ? `${caseData.type} Frequency` : 'General Activity'}
                 </p>
                 <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                   Activity spikes observed between 22:00 - 02:00 hrs.
                 </p>
               </li>
             </ul>
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900 text-sm">
              <div className="flex gap-2 items-start text-blue-800 dark:text-blue-300">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>AI suggests investigating the correlation between {caseData?.type || 'crime'} spikes and recent transfers in the {caseData?.location.city || 'local'} region (Correlation coeff: 0.85).</p>
              </div>
           </div>
        </div>
      </div>

      {/* Map & Network Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geospatial Cluster Map */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <MapPin size={18} className="text-navy-600 dark:text-blue-400" /> Geospatial Cluster
                </h4>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1 rounded-full flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-red-600 dark:text-red-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase">Hotspot Detected</span>
                </div>
            </div>
            <div className="flex-1 relative">
                {caseData ? (
                    <>
                        <div ref={mapContainer} className="absolute inset-0 z-0" />
                        {/* Legend Overlay */}
                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded shadow border border-slate-200 dark:border-slate-600 text-xs z-[400]">
                            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Incident</div>
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span> Predicted Zone</div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Select a case to view geospatial clusters</div>
                )}
            </div>
        </div>

        {/* Network Graph Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                    <Share2 size={18} /> {caseData ? `Network Analysis: ${caseData.id}` : 'Global Criminal Network Visualization'}
                </h4>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {/* Adjusting inner height style via prop or wrapper if NetworkGraph supports it, forcing fit */}
                <div className="absolute inset-0">
                    <NetworkGraph caseData={caseData} />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PatternDetection;
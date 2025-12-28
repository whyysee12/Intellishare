import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Settings, Database, Activity, Lock } from 'lucide-react';

const APIIntegration = () => {
  const [syncing, setSyncing] = useState<string | null>(null);

  const sources = [
    { id: 'cctns', name: 'CCTNS National DB', status: 'Connected', lastSync: '15 mins ago', type: 'Crime Records' },
    { id: 'vahan', name: 'Vahan 4.0', status: 'Connected', lastSync: '1 hour ago', type: 'Vehicle Registry' },
    { id: 'natgrid', name: 'NATGRID Bridge', status: 'Restricted', lastSync: '4 hours ago', type: 'Intel Aggregator' },
    { id: 'ivfrt', name: 'Immigration (IVFRT)', status: 'Connected', lastSync: '5 mins ago', type: 'Border Control' },
    { id: 'telecom', name: 'Telecom Subscriber DB', status: 'Error', lastSync: 'Failed yesterday', type: 'Communication' },
    { id: 'fiu', name: 'FIU-IND (Financial)', status: 'Connected', lastSync: '30 mins ago', type: 'Financial Intel' }
  ];

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
      alert("Synchronization complete for " + id.toUpperCase());
    }, 2000);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Database size={20} className="text-navy-600" /> Connected Intelligence Sources
          </h3>
          <button className="text-xs font-bold text-navy-600 hover:text-navy-800 flex items-center gap-1 border border-navy-200 px-3 py-1.5 rounded-md hover:bg-navy-50 transition">
             <Settings size={14} /> Configure Gateways
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {sources.map((source) => (
           <div key={source.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
             {/* Status Stripe */}
             <div className={`absolute top-0 left-0 w-1 h-full ${
               source.status === 'Connected' ? 'bg-emerald-500' :
               source.status === 'Restricted' ? 'bg-amber-500' : 'bg-red-500'
             }`}></div>

             <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <Activity size={24} className="text-navy-700" />
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                  source.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  source.status === 'Restricted' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {source.status === 'Connected' && <CheckCircle size={10} />}
                  {source.status === 'Restricted' && <Lock size={10} />}
                  {source.status === 'Error' && <AlertTriangle size={10} />}
                  {source.status.toUpperCase()}
                </div>
             </div>

             <h4 className="font-bold text-navy-900 text-lg mb-1">{source.name}</h4>
             <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-4">{source.type}</p>

             <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
               <span className="text-xs text-slate-400">Sync: {source.lastSync}</span>
               <button 
                 onClick={() => handleSync(source.id)}
                 disabled={!!syncing}
                 className={`p-2 rounded-md transition-all ${
                   syncing === source.id 
                     ? 'bg-navy-100 text-navy-800' 
                     : 'hover:bg-navy-50 text-slate-500 hover:text-navy-700'
                 }`}
               >
                 <RefreshCw size={18} className={syncing === source.id ? 'animate-spin' : ''} />
               </button>
             </div>
           </div>
         ))}
       </div>
       
       <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
         <Lock size={20} className="shrink-0 mt-0.5" />
         <div>
           <p className="font-bold">End-to-End Encryption Enabled</p>
           <p className="text-blue-700/80 text-xs mt-1">
             All API data transfers are secured using AES-256 encryption and TLS 1.3 protocol via the National Intelligence Grid backbone.
           </p>
         </div>
       </div>
    </div>
  );
};

export default APIIntegration;
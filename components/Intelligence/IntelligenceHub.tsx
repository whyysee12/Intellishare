import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Shield, 
  BrainCircuit, 
  ArrowUp, 
  Server, 
  Globe, 
  Lock, 
  FileText, 
  Users, 
  Activity,
  Layers,
  Search,
  Eye,
  CheckCircle,
  AlertOctagon,
  HardDrive
} from 'lucide-react';

const IntelligenceHub = () => {
  const navigate = useNavigate();
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const modules = [
    {
      id: 'continuity',
      title: 'Case Intelligence Canvas',
      desc: 'Visual pinboard & continuity timeline for officer handovers.',
      icon: Layers,
      path: '/analytics', // Directs to analytics where the board lives, ideally would be specific case
      color: 'bg-purple-600'
    },
    {
      id: 'face',
      title: 'Face-Based Enrichment',
      desc: 'Enrich suspect profiles using centralized face records.',
      icon: ScanFaceIcon,
      path: '/criminals',
      color: 'bg-blue-600'
    },
    {
      id: 'patterns',
      title: 'Cross-Case Pattern',
      desc: 'Detect hidden links across districts and states.',
      icon: Activity,
      path: '/analytics',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="text-navy-600 dark:text-blue-400" /> Investigative Intelligence Layer
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            AI-powered continuity and insight layer integrated on top of CCTNS 2.0 & NCRB.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded border border-emerald-100 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <CheckCircle size={14} /> Systems Operational
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono border border-slate-100 dark:border-slate-700 px-2 py-1 rounded">
             <Lock size={10} /> READ-ONLY INGESTION
           </div>
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono border border-slate-100 dark:border-slate-700 px-2 py-1 rounded">
             <Shield size={10} /> AUDIT LOGGED
           </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8 text-center">System Architecture</h3>

        <div className="flex flex-col items-center justify-center gap-2 max-w-4xl mx-auto">
          
          {/* TOP LAYER: INTELLIGENCE UI */}
          <div 
            className={`w-full p-6 rounded-xl border-2 transition-all duration-300 relative z-10 flex justify-around items-center bg-white dark:bg-slate-900 ${
              hoveredLayer === 'ui' ? 'border-navy-500 shadow-lg scale-105' : 'border-slate-200 dark:border-slate-600'
            }`}
            onMouseEnter={() => setHoveredLayer('ui')}
            onMouseLeave={() => setHoveredLayer(null)}
          >
             <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-xs font-bold text-navy-600 dark:text-blue-400 rotate-270 hidden md:block">
               INTELLIGENCE LAYER
             </div>
             {modules.map(mod => (
               <button 
                 key={mod.id}
                 onClick={() => navigate(mod.path)}
                 className="flex flex-col items-center gap-2 group"
               >
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 ${mod.color}`}>
                   <mod.icon size={24} />
                 </div>
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-navy-600 dark:group-hover:text-blue-400">{mod.title}</span>
               </button>
             ))}
          </div>

          {/* CONNECTOR ARROWS */}
          <div className="h-12 flex items-center justify-center">
             <div className="flex flex-col items-center animate-pulse text-slate-300">
               <ArrowUp size={24} />
               <span className="text-[9px] font-mono font-bold uppercase">AI Enrichment</span>
             </div>
          </div>

          {/* MIDDLE LAYER: INGESTION & AI ENGINE */}
          <div 
            className={`w-3/4 p-4 rounded-lg border-2 border-dashed bg-slate-50 dark:bg-slate-800/50 flex justify-center gap-8 transition-all ${
              hoveredLayer === 'engine' ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-600'
            }`}
            onMouseEnter={() => setHoveredLayer('engine')}
            onMouseLeave={() => setHoveredLayer(null)}
          >
             <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-600">
               <BrainCircuit size={18} className="text-purple-500" />
               <div className="text-left">
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Neural Engine</div>
                 <div className="text-[9px] text-slate-400">Gemini 1.5 Pro + FaceAPI</div>
               </div>
             </div>
             <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-600">
               <Lock size={18} className="text-emerald-500" />
               <div className="text-left">
                 <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Secure Gateway</div>
                 <div className="text-[9px] text-slate-400">End-to-End Encryption</div>
               </div>
             </div>
          </div>

          {/* CONNECTOR ARROWS */}
          <div className="h-12 flex items-center justify-center">
             <div className="flex flex-col items-center text-slate-300">
               <ArrowUp size={24} />
               <span className="text-[9px] font-mono font-bold uppercase">Read-Only API</span>
             </div>
          </div>

          {/* BOTTOM LAYER: CENTRAL SYSTEMS */}
          <div 
            className={`w-full p-6 rounded-xl border bg-slate-100 dark:bg-black/40 flex justify-around items-center transition-all ${
              hoveredLayer === 'source' ? 'border-slate-400' : 'border-slate-200 dark:border-slate-800'
            }`}
            onMouseEnter={() => setHoveredLayer('source')}
            onMouseLeave={() => setHoveredLayer(null)}
          >
             <div className="absolute -left-20 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 rotate-270 hidden md:block">
               SOURCE SYSTEMS
             </div>
             
             {/* ESAKYA Evidence System */}
             <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity p-2 rounded hover:bg-white/50 dark:hover:bg-white/10">
               <HardDrive size={32} className="text-cyan-600" />
               <div className="text-center">
                 <span className="block text-xs font-bold text-cyan-700 dark:text-cyan-400">ESAKYA</span>
                 <span className="text-[9px] text-slate-500 dark:text-slate-400">Digital Evidence</span>
               </div>
             </div>

             <div className="h-12 w-px bg-slate-300 dark:bg-slate-700"></div>

             <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
               <Database size={32} className="text-slate-600" />
               <span className="text-xs font-bold text-slate-600 dark:text-slate-400">CCTNS 2.0</span>
             </div>
             <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
               <Server size={32} className="text-slate-600" />
               <span className="text-xs font-bold text-slate-600 dark:text-slate-400">NCRB</span>
             </div>
             <div className="flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
               <Globe size={32} className="text-slate-600" />
               <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ICJS</span>
             </div>
          </div>

        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start">
            <div className={`p-3 rounded-lg ${mod.color} text-white mb-4`}>
              <mod.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">{mod.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">{mod.desc}</p>
            <button 
              onClick={() => navigate(mod.path)}
              className="w-full py-2 border border-slate-300 dark:border-slate-600 rounded font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Launch Module
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex gap-3 text-sm text-amber-900 dark:text-amber-200">
        <AlertOctagon size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-bold">Legal & Governance Notice</p>
          <p className="mt-1 opacity-90 text-xs">
            This Intelligence Layer provides AI-generated insights based on read-only access to CCTNS/NCRB and ESAKYA data. 
            Inferences generated here (e.g., "Suspected Links") are for investigative guidance only and must be verified by an authorized officer before inclusion in official case files or charge sheets.
          </p>
        </div>
      </div>
    </div>
  );
};

const ScanFaceIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01" />
    <path d="M15 9h.01" />
  </svg>
);

export default IntelligenceHub;

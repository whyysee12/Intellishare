import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Shield, 
  BrainCircuit, 
  Search, 
  MapPin 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_CASES, RECENT_ACTIVITY } from '../../data/mockData';

// Restored Components
import StatsCard from './StatsCard';
import CrimeHeatmap from './CrimeHeatmap';
import ActivityFeed from './ActivityFeed';
import TrendingPatterns from './TrendingPatterns';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Calculate Stats
  const totalCases = MOCK_CASES.length;
  const activeCases = MOCK_CASES.filter(c => c.status === 'Under Investigation').length;
  const highPriority = MOCK_CASES.filter(c => c.priority === 'High').length;
  const closedCases = MOCK_CASES.filter(c => c.status === 'Closed').length;

  return (
    <div className="space-y-8 animate-fade-in pb-6">
      
      {/* 1. Header with Continuity Positioning */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <Briefcase className="text-navy-600 dark:text-blue-400" /> Investigative Continuity Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Reducing information loss during officer transfers. A read-only intelligence layer for CCTNS & ESAKYA.
          </p>
        </div>
        <div className="flex gap-3 pb-2">
           <Link to="/ingest" className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm shadow-sm">
             <Plus size={16} /> New Entry
           </Link>
        </div>
      </div>

      {/* 2. Restored Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Registered Cases" 
          value={totalCases} 
          subtext="+4 this week" 
          icon={FileText} 
        />
        <StatsCard 
          title="Active Investigations" 
          value={activeCases} 
          subtext="Requires attention" 
          icon={Users} 
          alert={activeCases > 10}
        />
        <StatsCard 
          title="High Priority" 
          value={highPriority} 
          subtext="Immediate action" 
          icon={AlertTriangle} 
          alert={true}
        />
        <StatsCard 
          title="Solved / Closed" 
          value={closedCases} 
          subtext="94% Clearance Rate" 
          icon={CheckCircle} 
        />
      </div>

      {/* 3. Continuity & Impact Section (The New Core Narrative) */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
         {/* Background decoration */}
         <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left: Action */}
            <div className="lg:col-span-1 space-y-4">
               <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider">
                 <Shield size={14} /> Officer Continuity Mode
               </div>
               <h3 className="text-2xl font-bold leading-tight">
                 Joining a case mid-stream?
               </h3>
               <p className="text-blue-100 text-sm opacity-90">
                 Instantly visualize timelines, missing evidence, and suspect links without reading through 500+ pages of physical files.
               </p>
               <button 
                 onClick={() => navigate('/intelligence')}
                 className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
               >
                 Launch Continuity View <ArrowRight size={18} />
               </button>
            </div>

            {/* Right: Impact Metrics */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Handover Time', val: '~30 Mins', prev: '3-5 Days' },
                 { label: 'Briefing Prep', val: '~10 Mins', prev: '2-3 Hours' },
                 { label: 'Cross-Case Lookup', val: 'Instant', prev: 'Multi-System' },
                 { label: 'Evidence Context', val: 'Visual', prev: 'Manual' },
               ].map((m, i) => (
                 <div key={i} className="bg-white/10 border border-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="text-[10px] text-blue-200 uppercase font-bold mb-1">{m.label}</div>
                    <div className="text-lg font-bold text-white">{m.val}</div>
                    <div className="text-[10px] text-white/50 line-through decoration-red-400">{m.prev}</div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* 4. Situational Awareness (Map + Activity) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[500px]">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
               <MapPin size={18} className="text-navy-600 dark:text-blue-400" /> Geospatial Crime Heatmap
             </h3>
             <div className="flex gap-2">
               <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Violent</span>
               <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Property</span>
             </div>
           </div>
           <div className="flex-1 relative">
             <CrimeHeatmap />
           </div>
        </div>
        
        <div className="xl:col-span-1 h-full">
           <ActivityFeed activities={RECENT_ACTIVITY} />
        </div>
      </div>

      {/* 5. Advanced Intelligence (Trends) */}
      <div className="grid grid-cols-1 gap-6">
         <TrendingPatterns />
      </div>

    </div>
  );
};

export default Dashboard;
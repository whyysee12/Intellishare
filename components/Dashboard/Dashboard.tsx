import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  Search,
  Plus,
  Shield,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_CASES, RECENT_ACTIVITY } from '../../data/mockData';

// Components
import CrimeHeatmap from './CrimeHeatmap';
import StatsCard from './StatsCard';
import ActivityFeed from './ActivityFeed';
import TrendingPatterns from './TrendingPatterns';

const Dashboard = () => {
  const { user } = useAuth();
  const { preferences } = useTheme();
  
  // Quick stats calculation
  const totalCases = MOCK_CASES.length;
  const activeCases = MOCK_CASES.filter(c => c.status === 'Under Investigation').length;
  const highPriority = MOCK_CASES.filter(c => c.priority === 'High').length;

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">Operational Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Overview of real-time intelligence and agency operations.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/ingest" className="flex items-center gap-2 bg-navy-800 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition shadow-sm font-medium text-sm">
             <Plus size={16} /> New Case File
           </Link>
           <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-sm shadow-sm">
             <FileText size={16} /> Generate Report
           </button>
        </div>
      </div>

      {/* Stats Grid - Controlled by User Preference */}
      {preferences.showQuickStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Indexed Cases" 
            value={totalCases} 
            subtext="+12% vs last month" 
            icon={FileText} 
          />
          <StatsCard 
            title="Active Investigations" 
            value={activeCases} 
            subtext="4 cases approaching deadline" 
            icon={Search} 
          />
          <StatsCard 
            title="Agency Queries" 
            value="128" 
            subtext="24 pending approval" 
            icon={Users} 
          />
          <StatsCard 
            title="Critical Alerts" 
            value={highPriority} 
            subtext="Immediate action required" 
            icon={AlertTriangle} 
            alert={highPriority > 0} 
          />
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left Column: Activity Feed (3 cols) */}
        <div className="xl:col-span-3 h-full flex flex-col">
          <ActivityFeed activities={RECENT_ACTIVITY} />
        </div>

        {/* Center Column: Heatmap (6 cols) */}
        <div className="xl:col-span-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-full min-h-[500px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
             <h3 className="font-bold text-navy-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
               <Shield size={16} className="text-navy-700 dark:text-blue-400" />
               Live Crime Heatmap
             </h3>
             <div className="flex items-center gap-2">
               <button className="p-1.5 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-navy-700 rounded border border-transparent hover:border-slate-200 transition">
                  <Filter size={14} />
               </button>
               <select className="text-xs border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 shadow-sm focus:ring-1 focus:ring-navy-500 outline-none cursor-pointer">
                 <option>All Crimes</option>
                 <option>Theft</option>
                 <option>Violent</option>
                 <option>Cyber</option>
               </select>
             </div>
          </div>
          <div className="flex-1 relative">
            <CrimeHeatmap />
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>{preferences.realTimeMap ? 'Updating real-time (WebSocket connected)' : 'Real-time updates paused'}</span>
            <span>Coordinates: 22.5937° N, 78.9629° E</span>
          </div>
        </div>

        {/* Right Column: Trending Patterns (3 cols) */}
        <div className="xl:col-span-3 h-full flex flex-col">
          <TrendingPatterns />
        </div>

      </div>

      {/* Bottom: Deep Search Call to Action */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-lg p-6 text-white shadow-lg flex items-center justify-between">
         <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Search className="text-blue-400" size={20} /> Deep Investigation Search
            </h3>
            <p className="text-blue-100 text-sm mt-1 max-w-2xl">
              Cross-reference data against CCTNS, Vahan, Immigration, and Bank Transaction databases.
            </p>
         </div>
         <button className="bg-white text-navy-900 hover:bg-blue-50 px-5 py-2.5 rounded-md font-bold text-sm shadow-lg transition">
           Launch Search Tool
         </button>
      </div>
    </div>
  );
};

export default Dashboard;
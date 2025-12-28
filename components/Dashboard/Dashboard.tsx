import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  Search,
  Plus,
  Shield,
  Filter,
  Database,
  Globe,
  CreditCard,
  Car,
  Loader,
  CheckCircle,
  X
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
  const navigate = useNavigate();
  
  // Quick stats calculation
  const totalCases = MOCK_CASES.length;
  const activeCases = MOCK_CASES.filter(c => c.status === 'Under Investigation').length;
  const highPriority = MOCK_CASES.filter(c => c.priority === 'High').length;

  // Deep Search State
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  
  const searchSteps = [
    { label: 'Authenticating Secure Gateway...', icon: Shield },
    { label: 'Querying CCTNS Criminal Database...', icon: Database },
    { label: 'Scanning Vahan 4.0 Vehicle Registry...', icon: Car },
    { label: 'Cross-referencing Immigration (IVFRT)...', icon: Globe },
    { label: 'Analyzing FIU-IND Financial Logs...', icon: CreditCard },
    { label: 'Consolidating Intelligence Report...', icon: FileText },
  ];

  const handleLaunchDeepSearch = () => {
    setIsDeepSearchOpen(true);
    setSearchStep(0);
  };

  useEffect(() => {
    let timer: any;
    if (isDeepSearchOpen && searchStep < searchSteps.length) {
      timer = setTimeout(() => {
        setSearchStep(prev => prev + 1);
      }, 800); // 800ms per step
    } else if (isDeepSearchOpen && searchStep === searchSteps.length) {
      // Finished
      timer = setTimeout(() => {
        setIsDeepSearchOpen(false);
        navigate('/search');
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isDeepSearchOpen, searchStep, navigate]);

  return (
    <div className="space-y-6 animate-fade-in pb-6 relative">
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
         <button 
           onClick={handleLaunchDeepSearch}
           className="bg-white text-navy-900 hover:bg-blue-50 px-5 py-2.5 rounded-md font-bold text-sm shadow-lg transition"
         >
           Launch Search Tool
         </button>
      </div>

      {/* Deep Search Simulation Modal */}
      {isDeepSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-navy-900 p-6 text-white border-b border-navy-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Database className="text-blue-400" size={24} /> Deep Intelligence Search
                  </h3>
                  <p className="text-blue-200 text-xs mt-1">Authorized access via National Intelligence Grid</p>
                </div>
                <button onClick={() => setIsDeepSearchOpen(false)} className="text-blue-300 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {searchSteps.map((step, index) => (
                  <div key={index} className={`flex items-center gap-3 transition-opacity duration-500 ${index > searchStep ? 'opacity-30' : 'opacity-100'}`}>
                    <div className={`p-2 rounded-full border-2 ${
                      index < searchStep 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-600' 
                        : index === searchStep 
                          ? 'bg-blue-50 border-blue-500 text-blue-600 animate-pulse'
                          : 'bg-slate-100 border-slate-300 text-slate-400'
                    }`}>
                      {index < searchStep ? <CheckCircle size={16} /> : <step.icon size={16} />}
                    </div>
                    <span className={`text-sm font-bold ${
                      index === searchStep ? 'text-navy-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                    {index === searchStep && (
                      <Loader size={14} className="ml-auto animate-spin text-blue-500" />
                    )}
                  </div>
                ))}
              </div>

              {searchStep >= searchSteps.length && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg p-3 text-center animate-fade-in">
                  <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    Cross-referencing Complete. Redirecting...
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-3 text-center border-t border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-400">
                SECURE CONNECTION • 256-BIT ENCRYPTION • AUDIT LOGGED
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
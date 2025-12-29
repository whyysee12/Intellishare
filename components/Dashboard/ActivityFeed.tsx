import React, { useState } from 'react';
import { ActivityLog } from '../../types';
import { X, FileText, Filter, Download, Search, ShieldAlert, CheckCircle, Info, AlertTriangle } from 'lucide-react';

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
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Extended mock logs for the modal view
  const fullLogs: ActivityLog[] = [
    ...activities,
    { id: '5', action: 'User Login', user: 'Officer Rajesh', timestamp: '3 hours ago', type: 'info' },
    { id: '6', action: 'Database Backup', user: 'System', timestamp: '4 hours ago', type: 'success' },
    { id: '7', action: 'Failed Login Attempt', user: 'Unknown IP (192.168.x.x)', timestamp: '5 hours ago', type: 'alert' },
    { id: '8', action: 'Case #2291 Updated', user: 'Analyst Sarah', timestamp: '6 hours ago', type: 'info' },
    { id: '9', action: 'Report Generated', user: 'Admin User', timestamp: 'Yesterday', type: 'success' },
    { id: '10', action: 'System Maintenance', user: 'IT Dept', timestamp: '2 days ago', type: 'warning' },
    { id: '11', action: 'New User Registered', user: 'Admin', timestamp: '2 days ago', type: 'success' },
    { id: '12', action: 'Permission Change', user: 'Super Admin', timestamp: '3 days ago', type: 'warning' },
  ];

  const filteredLogs = fullLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <ShieldAlert size={16} className="text-red-500" />;
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
           <h3 className="font-bold text-navy-900 dark:text-white text-sm uppercase tracking-wide">Recent Intel Activity</h3>
           <ActivityIndicator />
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-0 max-h-[400px]">
          {activities.map((log) => (
            <div key={log.id} className="flex gap-3 items-start p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className={`mt-1 min-w-[8px] h-2 rounded-full ${
                log.type === 'alert' ? 'bg-red-500' : 
                log.type === 'warning' ? 'bg-orange-500' : 'bg-navy-500'
              }`} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{log.action}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 mt-auto">
           <button 
             onClick={() => setShowModal(true)}
             className="text-navy-700 dark:text-blue-400 text-xs font-bold w-full text-center hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded uppercase tracking-wider transition-colors"
           >
             View Full System Log
           </button>
        </div>
      </div>

      {/* Full Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-lg">
                 <div>
                   <h3 className="font-bold text-navy-900 dark:text-white text-lg flex items-center gap-2">
                     <FileText size={20} className="text-navy-600 dark:text-blue-400" /> System Audit Log
                   </h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1"> comprehensive record of all system events and user actions.</p>
                 </div>
                 <button 
                   onClick={() => setShowModal(false)} 
                   className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition text-slate-500 dark:text-slate-400"
                 >
                   <X size={20} />
                 </button>
              </div>
              
              {/* Toolbar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-slate-800">
                 <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search logs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                 </div>
                 <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <Filter size={14} /> Filter
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 bg-navy-800 text-white rounded-md text-xs font-bold hover:bg-navy-700 shadow-sm">
                      <Download size={14} /> Export CSV
                    </button>
                 </div>
              </div>

              {/* Log Table */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase sticky top-0 border-b border-slate-200 dark:border-slate-700">
                       <tr>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3 text-right">Time</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                       {filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                             <td className="px-6 py-3">
                                <div className="flex items-center gap-2" title={log.type}>
                                   {getIcon(log.type)}
                                   <span className={`text-xs font-bold capitalize ${
                                      log.type === 'alert' ? 'text-red-600 dark:text-red-400' : 
                                      log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                                      log.type === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                                      'text-slate-600 dark:text-slate-400'
                                   }`}>{log.type}</span>
                                </div>
                             </td>
                             <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{log.action}</td>
                             <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-xs">{log.user}</td>
                             <td className="px-6 py-3 text-right text-slate-500 dark:text-slate-500 text-xs font-mono">{log.timestamp}</td>
                          </tr>
                       ))}
                       {filteredLogs.length === 0 && (
                          <tr>
                             <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No logs found matching your search.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
              
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-lg text-center text-[10px] text-slate-400">
                 System logs are retained for 90 days in accordance with data retention policy.
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ActivityFeed;
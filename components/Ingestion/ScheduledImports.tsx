import React, { useState } from 'react';
import { Clock, Plus, Play, Pause, FileText, MoreVertical, Trash2 } from 'lucide-react';

const ScheduledImports = () => {
  const [jobs, setJobs] = useState([
    { id: 1, name: 'Daily Traffic Violation Sync', source: 'Vahan 4.0', frequency: 'Daily @ 02:00 AM', status: 'Active', lastRun: 'Success' },
    { id: 2, name: 'Weekly FIR Consolidation', source: 'State Police DB', frequency: 'Weekly (Sun)', status: 'Active', lastRun: 'Success' },
    { id: 3, name: 'Immigration Watchlist Update', source: 'IVFRT', frequency: 'Hourly', status: 'Paused', lastRun: 'Warning' },
  ]);

  const toggleStatus = (id: number) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: j.status === 'Active' ? 'Paused' : 'Active' } : j));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <Clock size={20} className="text-navy-600" /> Automated Tasks
            </h3>
            <p className="text-xs text-slate-500 mt-1">Manage scheduled data ingestion cron jobs.</p>
         </div>
         <button className="bg-navy-800 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-navy-700 shadow-sm transition">
           <Plus size={16} /> New Schedule
         </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">Job Name</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Frequency</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Run</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-navy-900">{job.name}</td>
                <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" /> {job.source}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{job.frequency}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    job.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${
                    job.lastRun === 'Success' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {job.lastRun}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => toggleStatus(job.id)}
                       className={`p-1.5 rounded transition ${
                         job.status === 'Active' 
                           ? 'text-amber-600 hover:bg-amber-50' 
                           : 'text-emerald-600 hover:bg-emerald-50'
                       }`}
                       title={job.status === 'Active' ? 'Pause' : 'Resume'}
                     >
                       {job.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                     </button>
                     <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                       <Trash2 size={16} />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduledImports;
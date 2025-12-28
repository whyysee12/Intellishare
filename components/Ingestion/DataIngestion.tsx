import React, { useState } from 'react';
import { UploadCloud, FileText, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import ManualEntry from './ManualEntry';
import APIIntegration from './APIIntegration';
import ScheduledImports from './ScheduledImports';

const DataIngestion = () => {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="space-y-6">
       <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Data Ingestion Hub</h2>
          <p className="text-slate-500 text-sm mt-1">Upload case files, sync external APIs, or manually enter data.</p>
        </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {[
            { id: 'upload', label: 'File Upload', icon: UploadCloud },
            { id: 'manual', label: 'Manual Entry', icon: FileText },
            { id: 'api', label: 'API Connectors', icon: Globe },
            { id: 'schedule', label: 'Scheduled Jobs', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-navy-900 border-t-4 border-navy-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)]' 
                  : 'text-slate-500 hover:text-navy-700 hover:bg-slate-100 border-t-4 border-transparent'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-navy-700' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 flex-1 bg-white">
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'manual' && <ManualEntry />}
          {activeTab === 'api' && <APIIntegration />}
          {activeTab === 'schedule' && <ScheduledImports />}
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;
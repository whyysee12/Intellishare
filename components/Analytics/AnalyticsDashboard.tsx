import React, { useState } from 'react';
import { BarChart3, GitMerge, AlertTriangle, Activity } from 'lucide-react';
import PatternDetection from './PatternDetection';
import PredictiveAnalytics from './PredictiveAnalytics';
import LinkAnalysis from './LinkAnalysis';
import SentimentAnalysis from './SentimentAnalysis';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('pattern');

  return (
    <div className="space-y-6">
       <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">AI/ML Analytics Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Advanced intelligence processing, pattern recognition, and predictive modeling.</p>
        </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pattern')}
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'pattern' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 size={16} /> Pattern Detection
        </button>
        <button
          onClick={() => setActiveTab('predictive')}
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'predictive' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Activity size={16} /> Predictive & Anomalies
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'link' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <GitMerge size={16} /> Link Analysis
        </button>
        <button
          onClick={() => setActiveTab('sentiment')}
          className={`px-4 py-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'sentiment' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <AlertTriangle size={16} /> Threat & Sentiment
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'pattern' && <PatternDetection />}
        {activeTab === 'predictive' && <PredictiveAnalytics />}
        {activeTab === 'link' && <LinkAnalysis />}
        {activeTab === 'sentiment' && <SentimentAnalysis />}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
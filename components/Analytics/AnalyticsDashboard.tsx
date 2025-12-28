import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart3, GitMerge, AlertTriangle, Activity, ArrowLeft } from 'lucide-react';
import PatternDetection from './PatternDetection';
import PredictiveAnalytics from './PredictiveAnalytics';
import LinkAnalysis from './LinkAnalysis';
import SentimentAnalysis from './SentimentAnalysis';
import { MOCK_CASES } from '../../data/mockData';
import { Case } from '../../types';

const AnalyticsDashboard = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('pattern');
  const [caseData, setCaseData] = useState<Case | null>(null);

  useEffect(() => {
    if (id) {
      const foundCase = MOCK_CASES.find(c => c.id === id);
      setCaseData(foundCase || null);
    } else {
      setCaseData(null);
    }
  }, [id]);

  return (
    <div className="space-y-6">
       <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex justify-between items-start">
            <div>
              {caseData ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Link to="/cases" className="text-slate-400 hover:text-navy-600 dark:hover:text-blue-400 transition">
                      <ArrowLeft size={18} />
                    </Link>
                    <span className="text-xs font-mono font-bold bg-navy-100 text-navy-800 px-2 py-0.5 rounded">
                      ANALYSIS FOR: {caseData.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
                    {caseData.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Targeted intelligence report for {caseData.type} in {caseData.location.city}.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">Global Analytics Engine</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aggregated intelligence processing, pattern recognition, and predictive modeling.</p>
                </>
              )}
            </div>
            {caseData && (
               <div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${
                 caseData.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
               }`}>
                 {caseData.priority} Priority
               </div>
            )}
          </div>
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
        {activeTab === 'pattern' && <PatternDetection caseData={caseData} />}
        {activeTab === 'predictive' && <PredictiveAnalytics caseData={caseData} />}
        {activeTab === 'link' && <LinkAnalysis caseData={caseData} />}
        {activeTab === 'sentiment' && <SentimentAnalysis caseData={caseData} />}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
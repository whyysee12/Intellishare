import React, { useState } from 'react';
import { Search, GitMerge, User, ArrowRight, FileText } from 'lucide-react';

const LinkAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(false);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Link Analysis</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Discover hidden connections and shortest paths between entities.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
         <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4 items-end mb-8">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Entity A (Source)</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Name, Phone, or Vehicle" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-navy-600 bg-white text-slate-900 outline-none shadow-sm" 
                  defaultValue="Raj Malhotra" 
                />
              </div>
            </div>
            
            <div className="pb-2 text-slate-400">
               <ArrowRight size={20} />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Entity B (Target)</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Name, Phone, or Vehicle" 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-navy-600 bg-white text-slate-900 outline-none shadow-sm" 
                  defaultValue="Vikram Singh" 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={analyzing}
              className="bg-navy-800 text-white px-6 py-2 rounded-md font-bold hover:bg-navy-700 transition flex items-center gap-2 h-10 shadow-sm disabled:opacity-70"
            >
              {analyzing ? 'Tracing...' : 'Trace Path'} <GitMerge size={18} />
            </button>
         </form>

         {/* Results Area */}
         {result && (
           <div className="animate-fade-in border-t border-slate-100 dark:border-slate-700 pt-8">
             <h4 className="font-bold text-navy-900 dark:text-white mb-6 text-center">Connection Found: 2 Degrees of Separation</h4>
             
             <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative">
               
               {/* Node A */}
               <div className="text-center z-10">
                 <div className="w-16 h-16 bg-navy-100 dark:bg-navy-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg mx-auto mb-2">
                   <User size={24} className="text-navy-700 dark:text-blue-400" />
                 </div>
                 <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Raj Malhotra</p>
                 <p className="text-xs text-slate-500">Suspect (Theft)</p>
               </div>

               {/* Connection Line 1 */}
               <div className="hidden md:flex flex-col items-center flex-1 max-w-[150px]">
                 <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-600 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-[10px] text-slate-400 whitespace-nowrap">
                       Shared Call (24s)
                    </div>
                 </div>
               </div>

               {/* Node Mid */}
               <div className="text-center z-10">
                 <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg mx-auto mb-2">
                   <FileText size={20} className="text-orange-600 dark:text-orange-400" />
                 </div>
                 <p className="font-bold text-sm text-slate-800 dark:text-slate-200">FIR-2023-991</p>
                 <p className="text-xs text-slate-500">Shared Document</p>
               </div>

               {/* Connection Line 2 */}
               <div className="hidden md:flex flex-col items-center flex-1 max-w-[150px]">
                 <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-600 relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-2 text-[10px] text-slate-400 whitespace-nowrap">
                       Named as Witness
                    </div>
                 </div>
               </div>

               {/* Node B */}
               <div className="text-center z-10">
                 <div className="w-16 h-16 bg-navy-100 dark:bg-navy-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg mx-auto mb-2">
                   <User size={24} className="text-navy-700 dark:text-blue-400" />
                 </div>
                 <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Vikram Singh</p>
                 <p className="text-xs text-slate-500">Person of Interest</p>
               </div>

             </div>
             
             <div className="mt-8 text-center">
               <button className="text-sm text-navy-600 dark:text-blue-400 font-bold hover:underline">
                 View Detailed Report & Evidence Logs
               </button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default LinkAnalysis;
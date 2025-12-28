import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Filter, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  X,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  Eye,
  Car,
  Phone
} from 'lucide-react';
import { MOCK_CASES } from '../../data/mockData';
import { Case } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

// Simple "NLP" simulation helpers
const KNOWN_LOCATIONS = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Pune', 'Chennai'];
const KNOWN_TYPES = ['Theft', 'Fraud', 'Cybercrime', 'Drug Trafficking', 'Murder', 'Human Trafficking'];
const KNOWN_STATUSES = ['Registered', 'Under Investigation', 'Closed'];

interface ExtractedEntity {
  type: 'Location' | 'Crime Type' | 'Status' | 'Priority' | 'Keyword';
  value: string;
}

const SearchModule = () => {
  const { preferences } = useTheme();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<Case[]>(MOCK_CASES);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>([]);
  const [quickViewCase, setQuickViewCase] = useState<Case | null>(null);
  const [filters, setFilters] = useState({
    type: [] as string[],
    status: [] as string[],
    minScore: 0
  });

  // The "AI" Logic to process natural language
  const processQuery = (input: string) => {
    const lowerInput = input.toLowerCase();
    const newEntities: ExtractedEntity[] = [];
    
    // 1. Reset base results
    let filtered = [...MOCK_CASES];

    // 2. Extract Locations
    KNOWN_LOCATIONS.forEach(loc => {
      if (lowerInput.includes(loc.toLowerCase())) {
        newEntities.push({ type: 'Location', value: loc });
        filtered = filtered.filter(c => c.location.city === loc);
      }
    });

    // 3. Extract Crime Types
    KNOWN_TYPES.forEach(type => {
      // Check for plural variations simple check
      if (lowerInput.includes(type.toLowerCase())) {
        newEntities.push({ type: 'Crime Type', value: type });
        filtered = filtered.filter(c => c.type === type);
      }
    });

    // 4. Extract Status
    if (lowerInput.includes('active') || lowerInput.includes('open') || lowerInput.includes('investigation')) {
      newEntities.push({ type: 'Status', value: 'Under Investigation' });
      filtered = filtered.filter(c => c.status === 'Under Investigation');
    } else if (lowerInput.includes('closed') || lowerInput.includes('solved')) {
      newEntities.push({ type: 'Status', value: 'Closed' });
      filtered = filtered.filter(c => c.status === 'Closed');
    }

    // 5. Extract Priority
    if (lowerInput.includes('high priority') || lowerInput.includes('urgent') || lowerInput.includes('critical')) {
      newEntities.push({ type: 'Priority', value: 'High' });
      filtered = filtered.filter(c => c.priority === 'High');
    }

    // 6. Generic Keyword Search if no entities found, or to refine further
    if (newEntities.length === 0 && input.trim() !== '') {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(lowerInput) || 
        c.description.toLowerCase().includes(lowerInput) ||
        c.id.toLowerCase().includes(lowerInput)
      );
      newEntities.push({ type: 'Keyword', value: input });
    } else if (input.trim() !== '') {
        // Also refine by remaining text not part of entities (simplified)
        // In a real app, we'd remove the entity text from the string and search the remainder
    }

    setExtractedEntities(newEntities);
    setResults(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val === '') {
      setResults(MOCK_CASES);
      setExtractedEntities([]);
    } else {
      processQuery(val);
    }
  };

  const toggleVoiceSearch = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Simulate listening delay
      setTimeout(() => {
        const mockPhrase = "Show me high priority theft cases in Delhi";
        setQuery(mockPhrase);
        processQuery(mockPhrase);
        setIsListening(false);
      }, 2000);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(MOCK_CASES);
    setExtractedEntities([]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">Intelligent Search</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Use natural language to query the database (e.g., "Find active fraud cases in Mumbai").
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="relative max-w-3xl w-full">
           <div className={`relative flex items-center bg-white dark:bg-slate-800 border-2 rounded-xl transition-all shadow-sm ${
             isListening ? 'border-red-400 ring-4 ring-red-100 dark:ring-red-900/30' : 'border-navy-100 dark:border-slate-600 focus-within:border-navy-500 focus-within:ring-4 focus-within:ring-navy-50 dark:focus-within:ring-navy-900/50'
           }`}>
             <div className="pl-4 text-slate-400">
               <Search size={22} />
             </div>
             <input 
               type="text" 
               value={query}
               onChange={handleSearchChange}
               placeholder={isListening ? "Listening..." : "Describe the cases, entities or patterns you are looking for..."}
               className="w-full bg-transparent border-none px-4 py-4 text-lg text-navy-900 dark:text-white placeholder-slate-400 focus:ring-0 outline-none"
             />
             <div className="pr-2 flex items-center gap-2">
               {query && (
                 <button onClick={clearSearch} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X size={20} />
                 </button>
               )}
               <button 
                 onClick={toggleVoiceSearch}
                 className={`p-3 rounded-lg transition-all ${
                   isListening 
                     ? 'bg-red-500 text-white animate-pulse' 
                     : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-navy-700'
                 }`}
               >
                 <Mic size={20} />
               </button>
             </div>
           </div>
           
           {/* NLP Extraction Feedback */}
           {extractedEntities.length > 0 && (
             <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mr-2">
                 <Sparkles size={14} className="text-navy-600 dark:text-blue-400" />
                 Interpreted Query:
               </div>
               {extractedEntities.map((entity, idx) => (
                 <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-navy-50 dark:bg-navy-900/50 text-navy-700 dark:text-blue-300 border border-navy-100 dark:border-navy-800">
                   <span className="opacity-60 uppercase text-[10px] tracking-wider">{entity.type}:</span>
                   {entity.value}
                 </span>
               ))}
             </div>
           )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-6 overflow-y-auto custom-scrollbar pr-2">
           {/* Smart Suggestions */}
           {!query && (
             <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
               <h4 className="font-bold text-sm text-navy-900 dark:text-white mb-3 flex items-center gap-2">
                 <Sparkles size={14} className="text-amber-500" /> Suggested Queries
               </h4>
               <div className="space-y-2">
                 {[
                   "High priority theft cases in Delhi",
                   "Closed cybercrime cases last month",
                   "Narcotics suspects in Mumbai",
                   "Murder cases under investigation"
                 ].map((s, i) => (
                   <button 
                     key={i}
                     onClick={() => { setQuery(s); processQuery(s); }}
                     className="text-left w-full text-xs text-slate-600 dark:text-slate-300 hover:text-navy-700 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded transition-colors"
                   >
                     "{s}"
                   </button>
                 ))}
               </div>
             </div>
           )}

           <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
               <h4 className="font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                 <Filter size={16} /> Filters
               </h4>
               <button className="text-[10px] text-navy-600 dark:text-blue-400 hover:underline">Reset</button>
             </div>

             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Crime Type</label>
                 <div className="space-y-2">
                   {KNOWN_TYPES.map(type => (
                     <label key={type} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                       <input type="checkbox" className="rounded border-slate-300 text-navy-600 focus:ring-navy-500" />
                       {type}
                     </label>
                   ))}
                 </div>
               </div>
               
               <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Status</label>
                 <div className="space-y-2">
                   {KNOWN_STATUSES.map(status => (
                     <label key={status} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                       <input type="checkbox" className="rounded border-slate-300 text-navy-600 focus:ring-navy-500" />
                       {status}
                     </label>
                   ))}
                 </div>
               </div>

               <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Match Score Threshold</label>
                 <input type="range" className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-navy-600" />
                 <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                   <span>0%</span>
                   <span>50%</span>
                   <span>100%</span>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
               Found {results.length} matching cases
             </h3>
             <div className="flex items-center gap-2">
               <span className="text-xs text-slate-500 dark:text-slate-400">Sort by:</span>
               <select className="text-xs border border-slate-300 dark:border-slate-600 rounded p-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none">
                 <option>Relevance (AI)</option>
                 <option>Date: Newest First</option>
                 <option>Priority: High to Low</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-10">
             {results.map((c) => (
               <div key={c.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow group flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                       <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${
                           c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                         }`}></span>
                         <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{c.id}</span>
                       </div>
                       <h4 className="font-bold text-navy-900 dark:text-white mt-1 group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{c.title}</h4>
                     </div>
                     <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                       {c.similarityScore}% Match
                     </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                    {c.description}
                  </p>

                  <div className="space-y-2 mb-4">
                     <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                       <MapPin size={14} className="text-slate-400" /> {c.location.city}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                       <Calendar size={14} className="text-slate-400" /> {c.date}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                       <User size={14} className="text-slate-400" /> {c.assignedOfficer}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          c.status === 'Closed' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 
                          'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                       }`}>
                         {c.status}
                       </span>
                       <button 
                         onClick={() => setQuickViewCase(c)}
                         className="text-xs font-bold text-slate-500 hover:text-navy-700 dark:text-slate-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                         title="Quick Preview"
                       >
                         <Eye size={14} /> Quick View
                       </button>
                    </div>
                    <Link to={`/cases/${c.id}`} className="text-xs font-bold text-navy-700 dark:text-blue-400 flex items-center gap-1 hover:underline">
                      View File <ArrowRight size={12} />
                    </Link>
                  </div>
               </div>
             ))}
             {results.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-400">
                 <Search size={48} className="mx-auto mb-4 opacity-20" />
                 <p>No cases found matching your criteria.</p>
                 <button onClick={clearSearch} className="mt-2 text-navy-600 dark:text-blue-400 font-bold hover:underline">Clear Search</button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{quickViewCase.id}</span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                       quickViewCase.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                       'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                     }`}>
                       {quickViewCase.status}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">{quickViewCase.title}</h3>
               </div>
               <button onClick={() => setQuickViewCase(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600">
                 <X size={20} />
               </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
               <div className="mb-6">
                 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Summary</h4>
                 <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-700">
                   {quickViewCase.description}
                 </p>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location & Time</h4>
                     <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mb-1">
                       <MapPin size={14} className="text-navy-600 dark:text-blue-400" /> {quickViewCase.location.city}
                     </div>
                     <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                       <Calendar size={14} className="text-navy-600 dark:text-blue-400" /> {quickViewCase.date}
                     </div>
                  </div>
                  <div>
                     <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Officer in Charge</h4>
                     <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                       <User size={14} className="text-navy-600 dark:text-blue-400" /> {quickViewCase.assignedOfficer}
                     </div>
                  </div>
               </div>

               <div>
                 <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Entities Identified</h4>
                 <div className="flex flex-wrap gap-2">
                   {quickViewCase.entities.map((e, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border ${
                         e.type === 'Person' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400' :
                         e.type === 'Vehicle' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' :
                         'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                         {e.type === 'Person' && <User size={12} />}
                         {e.type === 'Vehicle' && <Car size={12} />}
                         {e.type === 'Phone' && <Phone size={12} />}
                         {e.value}
                      </span>
                   ))}
                 </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-lg flex justify-end gap-3">
               <button onClick={() => setQuickViewCase(null)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition">
                 Close
               </button>
               <Link to={`/cases/${quickViewCase.id}`} className="px-4 py-2 bg-navy-800 text-white rounded-md text-sm font-bold hover:bg-navy-700 transition flex items-center gap-2">
                 Open Full Investigation <ArrowRight size={16} />
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchModule;
import React, { useState, useEffect, useRef } from 'react';
import { 
  GitCommit, 
  MapPin, 
  FileText, 
  User, 
  Phone, 
  Car, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Briefcase,
  PlayCircle,
  ZoomIn,
  ZoomOut,
  Maximize,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Case } from '../../types';

interface Props {
  caseData?: Case | null;
}

// -- Mock Continuity Data --
const CONTINUITY_EVENTS = [
  { id: 1, date: '2024-03-10', title: 'FIR Registered', type: 'start', desc: 'Case opened. Initial theft report filed by victim.' },
  { id: 2, date: '2024-03-11', title: 'CCTV Evidence', type: 'evidence', desc: 'Footage retrieved from Sector 4 market showing suspect vehicle.' },
  { id: 3, date: '2024-03-12', title: 'Suspect ID', type: 'suspect', desc: 'Face match confirmed: Raj Malhotra (89% confidence).' },
  { id: 4, date: '2024-03-14', title: 'Raid Failed', type: 'action', desc: 'Raid at suspected hideout. Suspect fled prior to arrival. Laptop recovered.', reasoning: 'Intelligence suggested suspect was sleeping there. Leak suspected.' },
  { id: 5, date: '2024-03-15', title: 'New Lead', type: 'intel', desc: 'Phone triangulation points to interstate movement towards border.' },
];

const PINBOARD_NODES = [
  { id: 'n1', type: 'suspect', label: 'Raj Malhotra', status: 'Wanted', x: 400, y: 300, img: 'https://ui-avatars.com/api/?name=Raj+Malhotra&background=ef4444&color=fff' },
  { id: 'n2', type: 'evidence', label: 'CCTV Footage', x: 150, y: 100, icon: FileText },
  { id: 'n3', type: 'vehicle', label: 'DL-8C-AB-1234', x: 250, y: 250, icon: Car },
  { id: 'n4', type: 'location', label: 'Sector 4 Market', x: 100, y: 400, icon: MapPin },
  { id: 'n5', type: 'phone', label: '+91-9899...', x: 600, y: 350, icon: Phone },
  { id: 'n6', type: 'associate', label: 'Unknown Helper', status: 'Suspected', x: 650, y: 150, icon: HelpCircle },
  { id: 'n7', type: 'location', label: 'Hideout B', x: 500, y: 500, icon: MapPin },
];

const PINBOARD_LINKS = [
  { source: 'n2', target: 'n3', label: 'Seen in', style: 'solid', color: '#cbd5e1' },
  { source: 'n3', target: 'n1', label: 'Registered Owner', style: 'solid', color: '#ef4444' }, // Red string (strong)
  { source: 'n1', target: 'n4', label: 'Last Seen', style: 'dashed', color: '#f59e0b' },
  { source: 'n1', target: 'n5', label: 'Primary Device', style: 'solid', color: '#3b82f6' },
  { source: 'n5', target: 'n6', label: 'Frequent Calls', style: 'dashed', color: '#ef4444' }, // Red string
  { source: 'n1', target: 'n7', label: 'Fled to?', style: 'dotted', color: '#94a3b8' },
];

const VisualContinuityBoard: React.FC<Props> = ({ caseData }) => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [handoverMode, setHandoverMode] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // SVG Pan/Zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const generateHandoverBrief = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // In a real app, pass dynamic PINBOARD_NODES and CONTINUITY_EVENTS
      const prompt = `
        Act as a senior police commander handing over a case to a new officer.
        Create a "10-Minute Handover Briefing" for Case: ${caseData?.title || 'Unknown'}.
        
        Use this data:
        Timeline: ${JSON.stringify(CONTINUITY_EVENTS.map(e => `${e.date}: ${e.title} - ${e.desc} (${e.reasoning || ''})`))}
        Key Suspect: Raj Malhotra (Wanted).
        
        Output format (HTML):
        <h3>🚨 Critical Situation Report</h3>
        <p>[1-2 sentences on current status]</p>
        
        <h4>✅ Confirmed Facts</h4>
        <ul>[Bullet points of solid evidence]</ul>
        
        <h4>⚠️ Knowledge Gaps & Risks</h4>
        <ul>[What we don't know yet, e.g. associate identity]</ul>
        
        <h4>🛑 Previous Failures (Learn from this)</h4>
        <p>[Mention the failed raid and reasoning]</p>
        
        <h4>👉 Recommended Next Actions</h4>
        <ol>[3 concrete steps]</ol>
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiBriefing(response.text || "Failed to generate briefing.");
    } catch (e) {
      console.error(e);
      setAiBriefing("<h3>Error</h3><p>Secure AI Gateway unavailable. Using cached continuity logs.</p>");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (handoverMode && !aiBriefing) {
      generateHandoverBrief();
    }
  }, [handoverMode]);

  // Board Navigation Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className={`flex flex-col h-[700px] bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative ${handoverMode ? 'ring-4 ring-emerald-500/20' : ''}`}>
      
      {/* Top Control Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="text-purple-600" size={20} />
            Visual Continuity Board
          </h3>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex gap-2">
             <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"><ZoomOut size={18} /></button>
             <span className="text-xs font-mono self-center text-slate-400">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500"><ZoomIn size={18} /></button>
             <button onClick={() => setPan({x:0, y:0})} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 ml-1" title="Center"><Maximize size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <span className="text-xs font-medium text-slate-500 hidden sm:block">Officer Handover Mode:</span>
           <button 
             onClick={() => setHandoverMode(!handoverMode)}
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${handoverMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
           >
             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${handoverMode ? 'translate-x-6' : 'translate-x-1'}`} />
           </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT: Timeline Rail */}
        <div className="w-16 sm:w-20 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 z-10 overflow-y-auto custom-scrollbar">
           {CONTINUITY_EVENTS.map((event, i) => (
             <div key={event.id} className="flex flex-col items-center mb-6 group cursor-pointer" onClick={() => setSelectedEvent(event.id)}>
                <div className="text-[10px] font-mono text-slate-400 mb-1">{event.date.substring(5)}</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                  selectedEvent === event.id 
                    ? 'bg-navy-800 text-white border-navy-600 scale-110 shadow-lg' 
                    : handoverMode 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 border-slate-300 dark:border-slate-600 grayscale'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 group-hover:border-navy-400'
                }`}>
                   {event.type === 'start' && <FlagIcon />}
                   {event.type === 'evidence' && <FileText size={14} />}
                   {event.type === 'suspect' && <User size={14} />}
                   {event.type === 'action' && <AlertTriangle size={14} />}
                   {event.type === 'intel' && <MapPin size={14} />}
                </div>
                {i < CONTINUITY_EVENTS.length - 1 && (
                  <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-700 mt-2"></div>
                )}
             </div>
           ))}
        </div>

        {/* CENTER: Digital Pinboard (Canvas) */}
        <div 
          ref={containerRef}
          className="flex-1 bg-[#1e293b] relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
           {/* Background Grid */}
           <div 
             className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                backgroundSize: '20px 20px',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
             }} 
           />

           <div 
             className="absolute top-0 left-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
             style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
           >
              <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none">
                 <defs>
                   <marker id="arrow-pin" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                     <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                   </marker>
                 </defs>
                 {PINBOARD_LINKS.map((link, i) => {
                    const s = PINBOARD_NODES.find(n => n.id === link.source);
                    const t = PINBOARD_NODES.find(n => n.id === link.target);
                    if(!s || !t) return null;
                    return (
                      <g key={i}>
                        <line 
                          x1={s.x + 60} y1={s.y + 40} // Center approx
                          x2={t.x + 60} y2={t.y + 40} 
                          stroke={link.color} 
                          strokeWidth={link.style === 'solid' ? 3 : 2}
                          strokeDasharray={link.style === 'dotted' ? '4 4' : link.style === 'dashed' ? '8 8' : '0'}
                          strokeOpacity={handoverMode ? 0.4 : 0.8}
                        />
                        {/* Label on line */}
                        <text 
                          x={(s.x + t.x + 120)/2} 
                          y={(s.y + t.y + 80)/2 - 5} 
                          fill={link.color} 
                          fontSize="12" 
                          fontWeight="bold"
                          textAnchor="middle"
                          style={{ textShadow: '0 1px 2px black' }}
                        >
                          {link.label}
                        </text>
                      </g>
                    );
                 })}
              </svg>

              {PINBOARD_NODES.map((node) => (
                <div 
                  key={node.id}
                  className={`absolute w-32 bg-slate-800 border-2 rounded-lg shadow-2xl p-2 flex flex-col items-center gap-2 select-none group hover:z-50 hover:scale-105 transition-transform ${
                    handoverMode && node.type !== 'suspect' && node.type !== 'location' ? 'opacity-40 blur-[1px]' : 'opacity-100'
                  }`}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    borderColor: node.type === 'suspect' ? '#ef4444' : node.type === 'evidence' ? '#3b82f6' : '#64748b'
                  }}
                >
                   {/* Pin Visual */}
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border border-white shadow-sm z-10"></div>
                   
                   {node.img ? (
                     <img src={node.img} className="w-16 h-16 rounded-md object-cover border border-slate-600" alt={node.label} />
                   ) : (
                     <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        {node.icon && <node.icon size={20} />}
                     </div>
                   )}
                   
                   <div className="text-center">
                     <span className={`text-[9px] uppercase font-bold px-1.5 rounded ${
                        node.type === 'suspect' ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-slate-300'
                     }`}>
                       {node.type}
                     </span>
                     <p className="text-xs font-bold text-white mt-1 leading-tight">{node.label}</p>
                     {node.status && <p className="text-[10px] text-amber-400 font-mono mt-0.5">{node.status}</p>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT: AI Handover Panel (Collapsible) */}
        {handoverMode && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-emerald-500 shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <Briefcase size={18} /> Officer Handover
                </h3>
                <button onClick={() => setHandoverMode(false)} className="hover:bg-emerald-700 p-1 rounded"><PlayCircle size={16} /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                {loadingAi ? (
                  <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-slate-500">Generating situational brief...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: aiBriefing || '' }} />
                  </div>
                )}

                {/* Reasoning Log (Continuity Feature) */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                     <MessageSquare size={14} /> Decision Logic Log
                   </h4>
                   <div className="space-y-3">
                      {CONTINUITY_EVENTS.filter(e => e.reasoning).map(e => (
                        <div key={e.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 p-3 rounded text-xs">
                           <div className="font-bold text-amber-800 dark:text-amber-400 mb-1">{e.title} ({e.date})</div>
                           <p className="text-slate-700 dark:text-slate-300 italic">" {e.reasoning} "</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             
             <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
               <button className="w-full bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold py-2.5 rounded shadow flex items-center justify-center gap-2 transition">
                 <CheckCircle size={14} /> Acknowledge Handover
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
);

export default VisualContinuityBoard;

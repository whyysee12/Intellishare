import React, { useState, useEffect } from 'react';
import { Search, GitMerge, User, ArrowRight, FileText, Phone, Car, MapPin, Share2 } from 'lucide-react';
import { Case } from '../../types';

interface Props {
  caseData?: Case | null;
}

const LinkAnalysis: React.FC<Props> = ({ caseData }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);
  const [displayNodes, setDisplayNodes] = useState<any[]>([]);
  const [displayLinks, setDisplayLinks] = useState<any[]>([]);

  // Default Mock Data (Global View)
  const defaultNodes = [
    { id: '1', label: 'Raj Malhotra', type: 'person', x: 100, y: 100, color: '#ef4444' }, 
    { id: '2', label: 'Vikram Singh', type: 'person', x: 500, y: 100, color: '#ef4444' }, 
    { id: '3', label: '+91-9899123456', type: 'phone', x: 300, y: 50, color: '#3b82f6' }, 
    { id: '4', label: 'DL-8C-AB-1234', type: 'vehicle', x: 200, y: 220, color: '#f97316' },
    { id: '5', label: 'Amit Kumar', type: 'person', x: 300, y: 300, color: '#64748b' },
    { id: '6', label: 'Sec-14 Hideout', type: 'location', x: 400, y: 220, color: '#22c55e' },
    { id: '7', label: 'FIR-2024-1102', type: 'case', x: 600, y: 220, color: '#a855f7' },
  ];

  const defaultLinks = [
    { source: '1', target: '3', label: 'Call (14s)', isPath: true }, 
    { source: '3', target: '2', label: 'SMS History', isPath: true }, 
    { source: '1', target: '4', label: 'Owner', isPath: false },
    { source: '4', target: '6', label: 'Spotted at', isPath: false },
    { source: '5', target: '6', label: 'Resident', isPath: false },
    { source: '5', target: '3', label: 'Frequent Calls', isPath: false },
    { source: '2', target: '7', label: 'Suspect in', isPath: false },
    { source: '2', target: '6', label: 'Meeting Point', isPath: false },
  ];

  useEffect(() => {
    if (caseData) {
      // Dynamic generation based on specific case
      // 1. Central Node = The Case
      const nodes = [
        { id: 'root', label: caseData.id, type: 'case', x: 350, y: 175, color: '#a855f7' }
      ];
      const links: any[] = [];

      // 2. Entity Nodes around the center
      caseData.entities.forEach((entity, i) => {
        const angle = (i / caseData.entities.length) * 2 * Math.PI;
        const radius = 150;
        const x = 350 + radius * Math.cos(angle);
        const y = 175 + radius * Math.sin(angle);
        
        let color = '#64748b';
        if (entity.type === 'Person') color = '#ef4444';
        if (entity.type === 'Phone') color = '#3b82f6';
        if (entity.type === 'Vehicle') color = '#f97316';
        if (entity.type === 'Location') color = '#22c55e';

        const nodeId = `ent-${i}`;
        nodes.push({
          id: nodeId,
          label: entity.value,
          type: entity.type.toLowerCase(),
          x,
          y,
          color
        });

        // Link to Case
        links.push({
          source: 'root',
          target: nodeId,
          label: 'Involved',
          isPath: true
        });
      });

      // 3. Location Node (if separate from entities)
      nodes.push({
        id: 'loc-main',
        label: caseData.location.city,
        type: 'location',
        x: 600,
        y: 300,
        color: '#22c55e'
      });
      links.push({ source: 'root', target: 'loc-main', label: 'Jurisdiction', isPath: false });

      setDisplayNodes(nodes);
      setDisplayLinks(links);
      setResult(true); // Auto-show result for specific case
    } else {
      setDisplayNodes(defaultNodes);
      setDisplayLinks(defaultLinks);
      setResult(false);
    }
  }, [caseData]);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(false);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(true);
    }, 1500);
  };

  const getNodeIcon = (type: string) => {
    switch(type) {
        case 'person': return <User size={16} />;
        case 'phone': return <Phone size={16} />;
        case 'vehicle': return <Car size={16} />;
        case 'location': return <MapPin size={16} />;
        case 'case': return <FileText size={16} />;
        default: return <Share2 size={16} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
           <h3 className="text-lg font-bold text-navy-900 dark:text-white">Link Analysis</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">
             {caseData ? `Visualizing network for ${caseData.id}` : 'Discover hidden connections and shortest paths between entities.'}
           </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
         {!caseData && (
           <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4 items-end mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Entity A (Source)</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Name, Phone, or Vehicle" 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-navy-600 bg-white dark:bg-slate-700 dark:text-white outline-none shadow-sm" 
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-navy-600 bg-white dark:bg-slate-700 dark:text-white outline-none shadow-sm" 
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
         )}

         {/* Results Area */}
         {result ? (
           <div className="animate-fade-in relative h-[400px] w-full border border-slate-100 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden">
             
             {/* Legend */}
             <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 p-3 rounded-lg border border-slate-200 dark:border-slate-600 text-xs shadow-sm backdrop-blur-sm">
                <h4 className="font-bold mb-2 text-navy-900 dark:text-white">Analysis Result</h4>
                <div className="space-y-1.5">
                   <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Suspect</div>
                   <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Communication</div>
                   <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Vehicle</div>
                   <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Location</div>
                   <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
                      <div className="w-4 h-0.5 bg-red-500"></div> Direct Connection
                   </div>
                </div>
             </div>

             <svg className="w-full h-full" viewBox="0 0 700 350">
                <defs>
                  <marker id="arrow-grey" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                  </marker>
                </defs>

                {/* Links */}
                {displayLinks.map((link, i) => {
                   const s = displayNodes.find(n => n.id === link.source);
                   const t = displayNodes.find(n => n.id === link.target);
                   if (!s || !t) return null;

                   return (
                     <g key={i}>
                       <line 
                         x1={s.x} y1={s.y} 
                         x2={t.x} y2={t.y} 
                         stroke={link.isPath ? "#ef4444" : "#cbd5e1"} 
                         strokeWidth={link.isPath ? "3" : "1.5"}
                         strokeDasharray={link.isPath ? "" : "5,5"}
                         className="transition-all duration-1000 ease-out"
                       />
                       {/* Label on path */}
                       <rect 
                         x={(s.x + t.x)/2 - 30} 
                         y={(s.y + t.y)/2 - 10} 
                         width="60" 
                         height="16" 
                         rx="4" 
                         fill={link.isPath ? "#fee2e2" : "#f1f5f9"} 
                         className={link.isPath ? "dark:fill-red-900/50" : "dark:fill-slate-800"}
                       />
                       <text 
                         x={(s.x + t.x)/2} 
                         y={(s.y + t.y)/2 + 3} 
                         textAnchor="middle" 
                         fontSize="9" 
                         fill={link.isPath ? "#b91c1c" : "#64748b"}
                         className={link.isPath ? "dark:fill-red-200 font-bold" : "dark:fill-slate-400"}
                       >
                         {link.label}
                       </text>
                     </g>
                   );
                })}

                {/* Nodes */}
                {displayNodes.map((node) => (
                   <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                      <circle 
                        cx={node.x} 
                        cy={node.y} 
                        r="20" 
                        fill={node.color} 
                        stroke="white" 
                        strokeWidth="3" 
                        className="shadow-lg dark:stroke-slate-800"
                      />
                      <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
                        <div className="flex items-center justify-center w-full h-full text-white">
                           {getNodeIcon(node.type)}
                        </div>
                      </foreignObject>
                      <text 
                        x={node.x} 
                        y={node.y + 35} 
                        textAnchor="middle" 
                        className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200"
                      >
                        {node.label}
                      </text>
                   </g>
                ))}
             </svg>
             
             <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow border border-slate-200 dark:border-slate-700">
               <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                 {caseData ? `Visualizing ${caseData.entities.length} directly linked entities` : 'Found 1 strong connection path via +91-9899123456'}
               </span>
             </div>
           </div>
         ) : (
           <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <div className="text-center text-slate-400">
                 <GitMerge size={48} className="mx-auto mb-3 opacity-20" />
                 <p className="text-sm">Enter two entities above to visualize their network connection.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default LinkAnalysis;
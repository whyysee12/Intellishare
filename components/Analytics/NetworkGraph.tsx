import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCw, X, Share2, FileText, MapPin, Phone, Car, User, AlertCircle, Filter, Network } from 'lucide-react';
import { MOCK_CASES } from '../../data/mockData';
import { Case } from '../../types';

interface NetworkGraphProps {
  caseData?: Case | null;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ caseData }) => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // New State for Global Filtering
  const [networkFilter, setNetworkFilter] = useState('All');

  // --- Dynamic Data Generation ---
  const { nodes, links } = useMemo(() => {
    let generatedNodes: any[] = [];
    let generatedLinks: any[] = [];
    const width = 800;
    const height = 600;

    if (caseData) {
      // --- SINGLE CASE VIEW ---
      // Central Node: The Case
      const centerX = width / 2;
      const centerY = height / 2;
      
      generatedNodes.push({
        id: caseData.id,
        label: caseData.id,
        type: 'Case',
        x: centerX,
        y: centerY,
        color: '#a855f7', // Purple
        details: caseData.title
      });

      // Satellite Nodes: Entities
      const entityCount = caseData.entities.length;
      const radius = 180;
      
      caseData.entities.forEach((entity, i) => {
        const angle = (i / entityCount) * 2 * Math.PI - (Math.PI / 2); // Start from top
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Color mapping
        let color = '#64748b';
        if (entity.type === 'Person') color = '#ef4444'; // Red
        if (entity.type === 'Vehicle') color = '#f97316'; // Orange
        if (entity.type === 'Phone') color = '#3b82f6'; // Blue
        if (entity.type === 'Location') color = '#22c55e'; // Green

        generatedNodes.push({
          id: `${caseData.id}-${i}`,
          label: entity.value,
          type: entity.type,
          x: x,
          y: y,
          color: color,
          details: `${entity.type} linked to ${caseData.id}`
        });

        generatedLinks.push({
          source: caseData.id,
          target: `${caseData.id}-${i}`
        });
      });

    } else {
      // --- GLOBAL NETWORK VIEW ---
      
      let filteredCases = MOCK_CASES;
      let hubName = "Global Intel";
      let hubColor = "#3b82f6"; // Blue default

      // Filter Logic for "Related FIRs"
      if (networkFilter !== 'All') {
        filteredCases = MOCK_CASES.filter(c => 
          c.type.toLowerCase().includes(networkFilter.toLowerCase()) ||
          c.title.toLowerCase().includes(networkFilter.toLowerCase())
        );
        hubName = `${networkFilter} Syndicate`;
        
        if (networkFilter.includes('Drug') || networkFilter.includes('Narcotics')) hubColor = '#ef4444'; // Red for High Risk
        if (networkFilter.includes('Theft') || networkFilter.includes('Burglary')) hubColor = '#f97316'; // Orange
        if (networkFilter.includes('Cyber')) hubColor = '#10b981'; // Emerald
      } else {
        // Limit 'All' view to recent 5 to prevent visual chaos
        filteredCases = MOCK_CASES.slice(0, 6);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Create a "Central Hub" node representing the Network Theme
      if (networkFilter !== 'All' && filteredCases.length > 0) {
          generatedNodes.push({
            id: 'HUB',
            label: hubName,
            type: 'Network',
            x: centerX,
            y: centerY,
            color: hubColor,
            details: `Aggregated Intelligence for ${filteredCases.length} related cases.`
          });
      }

      // 2. Position Cases around the Hub (or in a circle if no hub)
      const caseCount = filteredCases.length;
      const caseRadius = networkFilter !== 'All' ? 200 : 220;

      filteredCases.forEach((c, idx) => {
        const angle = (idx / caseCount) * 2 * Math.PI - (Math.PI / 2);
        const cx = centerX + caseRadius * Math.cos(angle);
        const cy = centerY + caseRadius * Math.sin(angle);

        generatedNodes.push({
          id: c.id,
          label: c.id,
          type: 'Case',
          x: cx,
          y: cy,
          color: '#a855f7', // Purple
          details: c.title,
          location: c.location.city // Stored for linking
        });

        // Link to Hub if active filter
        if (networkFilter !== 'All') {
            generatedLinks.push({
                source: 'HUB',
                target: c.id,
                style: 'solid'
            });
        }

        // 3. Add Key Entities for each Case
        // Show fewer entities in global view to reduce clutter
        const keyEntities = c.entities.slice(0, 2); 
        keyEntities.forEach((entity, eIdx) => {
           // Position entities relative to their case node
           // Fan them out away from center
           const entAngle = angle + ((eIdx === 0 ? -0.3 : 0.3)); 
           const entDist = 60;
           const ex = cx + entDist * Math.cos(entAngle);
           const ey = cy + entDist * Math.sin(entAngle);

           let color = '#64748b';
           if (entity.type === 'Person') color = '#ef4444'; 
           if (entity.type === 'Vehicle') color = '#f97316';
           if (entity.type === 'Phone') color = '#3b82f6';

           const nodeId = `${c.id}-${eIdx}`;
           generatedNodes.push({
             id: nodeId,
             label: entity.value,
             type: entity.type,
             x: ex,
             y: ey,
             color: color,
             details: `Linked to ${c.id}`
           });

           generatedLinks.push({
             source: c.id,
             target: nodeId,
             style: 'solid'
           });
        });
      });

      // 4. Cross-Case Linking (Intelligence logic)
      // Link cases if they are in the same city (Geospatial Relation)
      if (filteredCases.length > 1) {
          for (let i = 0; i < filteredCases.length; i++) {
              for (let j = i + 1; j < filteredCases.length; j++) {
                  const caseA = filteredCases[i];
                  const caseB = filteredCases[j];
                  
                  if (caseA.location.city === caseB.location.city) {
                      generatedLinks.push({
                          source: caseA.id,
                          target: caseB.id,
                          style: 'dashed',
                          label: 'Same City'
                      });
                  }
              }
          }
      }
    }

    return { nodes: generatedNodes, links: generatedLinks };
  }, [caseData, networkFilter]);

  // Handle auto-select for demo if it matches
  useEffect(() => {
    if (caseData) {
      setSelectedNode(nodes.find(n => n.id === caseData.id));
    }
  }, [caseData, nodes]);

  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  const handleViewCaseFiles = () => {
    if (!selectedNode) return;

    if (selectedNode.type === 'Case') {
       navigate(`/cases/${selectedNode.id}`);
       return;
    }

    // Try to find the case this node belongs to
    // In our ID scheme: {CaseID}-{Index}
    if (selectedNode.id.includes('FIR')) {
        const caseId = selectedNode.id.split('-').slice(0, 3).join('-');
        navigate(`/cases/${caseId}`);
    } else {
        alert("Navigating to entity registry...");
    }
  };

  const handleTrackActivity = () => {
    if (selectedNode) {
      alert(`Surveillance Protocol Initiated:\n\nActive tracking enabled for ${selectedNode.label} (${selectedNode.type}).\nYou will receive real-time alerts for any detected activity.`);
    }
  };

  const getEntityIcon = (type: string) => {
    switch(type) {
        case 'Person': case 'Suspect': return <User size={32} className="text-slate-600" />;
        case 'Vehicle': return <Car size={32} className="text-slate-600" />;
        case 'Communication': case 'Phone': return <Phone size={32} className="text-slate-600" />;
        case 'Location': return <MapPin size={32} className="text-slate-600" />;
        case 'Case': return <FileText size={32} className="text-slate-600" />;
        case 'Network': return <Network size={32} className="text-slate-600" />;
        default: return <AlertCircle size={32} className="text-slate-600" />;
    }
  };

  // Filter nodes based on search
  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-xl border border-slate-700 h-[600px] relative font-sans select-none">
      
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="bg-[#1e293b]/90 backdrop-blur border border-slate-600 rounded-lg p-4 text-white w-52 shadow-lg pointer-events-auto">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-200">
            <Share2 size={16} /> {caseData ? 'Case Network' : 'Global Network'}
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300 font-medium">
            {networkFilter !== 'All' && !caseData && (
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-white"></span> Syndicate Hub
                </div>
            )}
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span> Case File
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> Person (Suspect)
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span> Vehicle
            </div>
            {!caseData && (
               <div className="mt-2 pt-2 border-t border-slate-600 text-[10px] text-slate-400">
                  <span className="border-b border-dashed border-slate-400 mr-2 pb-0.5">---</span> Shared City Link
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Overlay (Search & Filter) */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
            {/* Global View Filter Dropdown */}
            {!caseData && (
                <div className="relative group">
                    <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                        <Filter size={14} />
                    </div>
                    <select 
                        value={networkFilter}
                        onChange={(e) => setNetworkFilter(e.target.value)}
                        className="bg-[#1e293b] text-white pl-9 pr-8 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500 shadow-lg appearance-none cursor-pointer hover:bg-[#283548] transition-colors"
                    >
                        <option value="All">All Recent Activity</option>
                        <option value="Drug Trafficking">Narcotics Networks</option>
                        <option value="Theft">Theft & Burglary Rings</option>
                        <option value="Cybercrime">Cybercrime Cells</option>
                        <option value="Fraud">Financial Fraud</option>
                    </select>
                </div>
            )}

            <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
            <input 
                type="text" 
                placeholder="Search graph..." 
                className="bg-[#1e293b] text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 shadow-lg placeholder-slate-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
            <button className="p-2 bg-[#1e293b] border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition shadow-lg">
            <RotateCw size={18} />
            </button>
        </div>
        {!caseData && networkFilter !== 'All' && (
            <div className="bg-emerald-900/80 text-emerald-200 text-[10px] px-3 py-1 rounded-full border border-emerald-700 shadow-sm backdrop-blur-sm">
                Visualizing related <strong>{networkFilter}</strong> cases
            </div>
        )}
      </div>

      {/* SVG Graph Canvas */}
      <svg className="w-full h-full cursor-default" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow" markerWidth="12" markerHeight="12" refX="34" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 L2,6 Z" fill="#64748b" />
          </marker>
        </defs>
        
        {/* Links */}
        {links.map((link, i) => {
          const s = nodes.find(n => n.id === link.source);
          const t = nodes.find(n => n.id === link.target);
          
          if (!s || !t) return null;

          // Only show link if both nodes are visible (search filter)
          const sVisible = filteredNodes.find(n => n.id === s.id);
          const tVisible = filteredNodes.find(n => n.id === t.id);
          
          if (!sVisible || !tVisible) return null;

          return (
            <line 
              key={i}
              x1={s.x} y1={s.y}
              x2={t.x} y2={t.y}
              stroke={link.style === 'dashed' ? '#94a3b8' : '#475569'}
              strokeWidth={link.style === 'dashed' ? "1" : "1.5"}
              strokeDasharray={link.style === 'dashed' ? "5,5" : "0"}
              className="opacity-60"
            />
          );
        })}

        {/* Nodes */}
        {filteredNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHub = node.type === 'Network';
          
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x},${node.y})`}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
            >
              {isSelected && (
                <circle 
                  r={isHub ? "45" : "32"} 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                  className="animate-spin-slow opacity-80"
                />
              )}
              <circle 
                r={isHub ? "35" : "24"} 
                fill={node.color} 
                stroke="#0f172a" 
                strokeWidth={isHub ? "4" : "3"}
                className="shadow-xl"
              />
              
              {/* Node Icon/Text */}
              {node.type === 'Case' ? (
                 <text dy="5" textAnchor="middle" fill="white" className="text-[10px] font-bold">FIR</text>
              ) : node.type === 'Network' ? (
                 <text dy="5" textAnchor="middle" fill="white" className="text-[10px] font-bold">NET</text>
              ) : (
                 <text dy="5" textAnchor="middle" fill="white" className="text-[10px] font-bold">{node.label.charAt(0)}</text>
              )}
              
              <text 
                dy={isHub ? "55" : "40"} 
                textAnchor="middle" 
                fill="#e2e8f0" 
                className="text-[10px] font-bold tracking-wide"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="absolute bottom-6 right-6 z-30 w-72 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 relative">
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 rounded-full p-1"
            >
              <X size={14} />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 pr-8 leading-tight">{selectedNode.label}</h3>
            
            <div className="mt-3 inline-block">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                selectedNode.type === 'Suspect' || selectedNode.type === 'Person' ? 'bg-red-50 text-red-600 border border-red-100' :
                selectedNode.type === 'Network' ? 'bg-blue-600 text-white border border-blue-700' :
                selectedNode.type === 'Case' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                'bg-blue-50 text-blue-600 border border-blue-100'
              }`}>
                {selectedNode.type}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">{selectedNode.details}</p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Connections:</span>
              <span className="text-sm font-bold text-slate-800">
                {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}
              </span>
            </div>
            
            <div className="mt-4">
               {selectedNode.type === 'Case' ? (
                 <button 
                   onClick={handleViewCaseFiles}
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-md shadow-purple-200"
                 >
                   Open Case File
                 </button>
               ) : selectedNode.type === 'Network' ? (
                 <button 
                   className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-md cursor-default"
                 >
                   System Aggregate Node
                 </button>
               ) : (
                 <button 
                   onClick={handleViewProfile}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-md shadow-blue-200"
                 >
                   View Full Entity Profile
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Full Profile Modal */}
      {showProfileModal && selectedNode && selectedNode.type !== 'Case' && selectedNode.type !== 'Network' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="relative h-24 bg-gradient-to-r from-navy-800 to-navy-600">
               <button 
                 onClick={() => setShowProfileModal(false)}
                 className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition"
               >
                 <X size={18} />
               </button>
               <div className="absolute -bottom-10 left-6 border-4 border-white dark:border-slate-800 rounded-full overflow-hidden shadow-md">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {getEntityIcon(selectedNode.type)}
                  </div>
               </div>
            </div>
            <div className="pt-12 px-6 pb-6">
               <h3 className="text-xl font-bold text-navy-900 dark:text-white">{selectedNode.label}</h3>
               <span className="text-xs font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block bg-slate-100 text-slate-700 border border-slate-200">
                 {selectedNode.type}
               </span>
               
               <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <span className="block text-xs text-slate-500 uppercase font-bold">ID</span>
                       <span className="font-mono text-slate-700 dark:text-slate-300">ENT-{Math.floor(Math.random()*1000)}</span>
                     </div>
                     <div>
                       <span className="block text-xs text-slate-500 uppercase font-bold">Status</span>
                       <span className="text-emerald-600 font-bold">Active Surveillance</span>
                     </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="block text-xs text-slate-500 uppercase font-bold mb-2">Recent Intelligence</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                      Subject flagged in connection with multiple incidents. High frequency of communication with known associates detected.
                    </p>
                  </div>
               </div>

               <div className="mt-6 flex gap-2">
                  <button 
                    onClick={handleViewCaseFiles}
                    className="flex-1 bg-navy-800 text-white py-2 rounded-md font-bold text-sm hover:bg-navy-700 transition"
                  >
                    View Associated Case
                  </button>
                  <button 
                    onClick={handleTrackActivity}
                    className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2 rounded-md font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Track Activity
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
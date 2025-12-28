import React, { useEffect, useState } from 'react';
import { Search, RotateCw, X, Share2 } from 'lucide-react';

const NetworkGraph = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Define nodes matching the provided image reference
  const nodes = [
    { id: '1', label: 'Rahul Sharma', type: 'Suspect', x: 350, y: 220, color: '#ef4444' }, // Center-ish top
    { id: '2', label: '+91-9876543210', type: 'Communication', x: 500, y: 160, color: '#3b82f6' }, // Top Right
    { id: '3', label: 'Jaipur Safehouse', type: 'Location', x: 580, y: 270, color: '#22c55e' }, // Right
    { id: '4', label: 'Suresh Reddy', type: 'Suspect', x: 480, y: 350, color: '#ef4444' }, // Bottom center
    { id: '5', label: 'Amit Verma', type: 'Suspect', x: 430, y: 480, color: '#ef4444' }, // Bottom
    { id: '6', label: 'RJ14-CA-1234', type: 'Vehicle', x: 250, y: 350, color: '#f97316' }, // Left bottom
    { id: '7', label: 'DL01-AB-9999', type: 'Vehicle', x: 650, y: 420, color: '#f97316' }, // Right bottom
  ];

  // Define links based on visual arrows
  const links = [
    { source: '1', target: '2' }, // Rahul -> Phone
    { source: '1', target: '3' }, // Rahul -> Location
    { source: '2', target: '3' }, // Phone -> Location
    { source: '6', target: '1' }, // RJ14 -> Rahul
    { source: '4', target: '6' }, // Suresh -> RJ14
    { source: '5', target: '4' }, // Amit -> Suresh
    { source: '5', target: '7' }, // Amit -> DL01
    { source: '4', target: '3' }  // Suresh -> Safehouse
  ];

  useEffect(() => {
    // Auto-select the main suspect initially to match screenshot
    const rahul = nodes.find(n => n.label === 'Rahul Sharma');
    if (rahul) setSelectedNode(rahul);
  }, []);

  return (
    <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-xl border border-slate-700 h-[600px] relative font-sans select-none">
      
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-20">
        <div className="bg-[#1e293b]/90 backdrop-blur border border-slate-600 rounded-lg p-4 text-white w-52 shadow-lg">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-200">
            <Share2 size={16} /> Link Analysis
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> Person (Suspect)
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span> Vehicle
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span> Communication
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span> Location
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search entities..." 
            className="bg-[#1e293b] text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 shadow-lg placeholder-slate-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2 bg-[#1e293b] border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition shadow-lg">
          <RotateCw size={18} />
        </button>
      </div>

      {/* SVG Graph Canvas */}
      <svg className="w-full h-full cursor-default">
        <defs>
          <marker id="arrow" markerWidth="12" markerHeight="12" refX="34" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 L2,6 Z" fill="#64748b" />
          </marker>
        </defs>
        
        {/* Links */}
        {links.map((link, i) => {
          const s = nodes.find(n => n.id === link.source)!;
          const t = nodes.find(n => n.id === link.target)!;
          return (
            <line 
              key={i}
              x1={s.x} y1={s.y}
              x2={t.x} y2={t.y}
              stroke="#475569"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
              className="opacity-60"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <g 
              key={node.id} 
              transform={`translate(${node.x},${node.y})`}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
            >
              {isSelected && (
                <circle 
                  r="32" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4"
                  className="animate-spin-slow opacity-80"
                />
              )}
              <circle 
                r="24" 
                fill={node.color} 
                stroke="#0f172a" 
                strokeWidth="3"
                className="shadow-xl"
              />
              <text 
                dy="40" 
                textAnchor="middle" 
                fill="#e2e8f0" 
                className="text-[11px] font-bold tracking-wide"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
              >
                {node.label}
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
                selectedNode.type === 'Suspect' ? 'bg-red-50 text-red-600 border border-red-100' :
                selectedNode.type === 'Vehicle' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                selectedNode.type === 'Communication' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                'bg-green-50 text-green-600 border border-green-100'
              }`}>
                {selectedNode.type === 'Suspect' ? 'SUSPECT' : selectedNode.type.toUpperCase()}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Connections:</span>
              <span className="text-sm font-bold text-slate-800">
                {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}
              </span>
            </div>
            
            <div className="mt-4">
               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-md shadow-blue-200">
                 View Full Entity Profile
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
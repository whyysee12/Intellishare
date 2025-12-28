import React, { useEffect, useRef, useState } from 'react';

// A simple simulation of a network graph using SVG
const NetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    // Generate dummy graph data
    const newNodes = [
      { id: 'main', type: 'Suspect', x: 300, y: 200, color: '#ef4444' }, // Red for suspect
      { id: 'p1', type: 'Associate', x: 200, y: 150, color: '#f97316' },
      { id: 'p2', type: 'Associate', x: 400, y: 150, color: '#f97316' },
      { id: 'v1', type: 'Vehicle', x: 250, y: 300, color: '#3b82f6' },
      { id: 'loc1', type: 'Location', x: 350, y: 300, color: '#22c55e' },
      { id: 'ph1', type: 'Phone', x: 150, y: 250, color: '#a855f7' },
    ];
    
    const newLinks = [
      { source: 'main', target: 'p1' },
      { source: 'main', target: 'p2' },
      { source: 'main', target: 'v1' },
      { source: 'p1', target: 'loc1' },
      { source: 'p2', target: 'ph1' },
      { source: 'v1', target: 'loc1' },
    ];

    setNodes(newNodes);
    setLinks(newLinks);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-700 h-[500px] relative">
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm text-xs text-white border border-gray-600">
        <h4 className="font-bold mb-2">Entity Legend</h4>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Suspect</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Associate</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Vehicle</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Location</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Phone</div>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing">
        <g>
          {/* Links */}
          {links.map((link, i) => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (!source || !target) return null;
            
            return (
              <line 
                key={i}
                x1={source.x} 
                y1={source.y} 
                x2={target.x} 
                y2={target.y} 
                stroke="#4b5563" 
                strokeWidth="2"
              />
            );
          })}
          
          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={node.id} transform={`translate(${node.x},${node.y})`}>
              <circle 
                r="20" 
                fill={node.color} 
                stroke="#fff" 
                strokeWidth="2"
                className="transition-all hover:scale-110"
              />
              <text 
                dy="35" 
                textAnchor="middle" 
                fill="#fff" 
                className="text-xs font-medium select-none"
              >
                {node.type}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
        * Interactive visualization (Force-directed layout simulation)
      </div>
    </div>
  );
};

export default NetworkGraph;

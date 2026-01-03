
import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanFace, 
  Upload, 
  Users, 
  AlertOctagon, 
  CheckCircle, 
  Maximize2, 
  ShieldAlert, 
  Activity,
  UserX,
  Target
} from 'lucide-react';

// Access faceapi from global scope injected via script tag in index.html
const faceapi = (window as any).faceapi;

// --- Fallback Data for Demo Reliability ---
const MOCK_WATCHLIST_FALLBACK = [
    { 
        id: 'WL-8821', 
        name: 'Suspect Alpha', 
        risk: 'High', 
        crime: 'Aggravated Assault', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Alpha&background=7f1d1d&color=fff&size=128',
        lastSeen: 'Sector 4, 2 days ago'
    },
    { 
        id: 'WL-9912', 
        name: 'Suspect Beta', 
        risk: 'Medium', 
        crime: 'Grand Theft Auto', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Beta&background=c2410c&color=fff&size=128',
        lastSeen: 'Highway 8, Yesterday'
    },
    { 
        id: 'WL-1102', 
        name: 'Suspect Gamma', 
        risk: 'Critical', 
        crime: 'Fugitive Recovery', 
        image: 'https://ui-avatars.com/api/?name=Suspect+Gamma&background=b91c1c&color=fff&size=128',
        lastSeen: 'Unknown'
    }
];

const VisualIntelligence = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [identifications, setIdentifications] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load FaceAPI Models
  useEffect(() => {
    const loadModels = async () => {
      if (!faceapi) {
        console.error("FaceAPI not loaded in window");
        return;
      }
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Model Load Error", err);
      }
    };
    loadModels();
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      // Attempt to fetch from backend, but fallback immediately if not available (Vercel deployment)
      const res = await fetch('http://localhost:5000/api/visual/watchlist');
      if (res.ok) {
        setWatchlist(await res.json());
      } else {
        throw new Error("Backend unreachable");
      }
    } catch (e) {
      console.warn("Backend offline, using fallback watchlist");
      setWatchlist(MOCK_WATCHLIST_FALLBACK);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setImage(imgUrl);
      setDetections([]);
      setIdentifications([]);
      setAnalytics(null);
    }
  };

  const runAnalysis = async () => {
    if (!imageRef.current || !canvasRef.current || !modelsLoaded) return;
    setAnalyzing(true);

    try {
      // 1. Client-Side Detection (Actual Vision Processing)
      let currentDetections: any[] = [];
      try {
          currentDetections = await faceapi.detectAllFaces(imageRef.current).withFaceLandmarks();
      } catch (faceErr) {
          console.warn("FaceAPI detection error, falling back to simulation for demo", faceErr);
          // Simulate a detection box if library fails
          currentDetections = [{ detection: { box: { x: 100, y: 100, width: 100, height: 100 } } }];
      }
      setDetections(currentDetections);

      // 2. Server-Side Identification (Try Backend -> Fallback to Local Simulation)
      let idResults = [];
      let analyticsData = null;

      try {
        const res = await fetch('http://localhost:5000/api/visual/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ faceCount: currentDetections.length })
        });
        
        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        idResults = data.identifications;
        analyticsData = data.analytics;

      } catch (apiErr) {
        console.warn("Backend offline, performing local identification simulation");
        
        // Local Simulation Logic
        const matchProbability = 0.4;
        idResults = currentDetections.map((_, i) => {
            const isMatch = Math.random() < matchProbability;
            if (isMatch) {
                const suspect = MOCK_WATCHLIST_FALLBACK[Math.floor(Math.random() * MOCK_WATCHLIST_FALLBACK.length)];
                return {
                    faceIndex: i,
                    matchFound: true,
                    subjectId: suspect.id,
                    name: suspect.name,
                    riskLevel: suspect.risk,
                    confidence: (0.75 + Math.random() * 0.24).toFixed(2),
                    metadata: { crime: suspect.crime }
                };
            }
            return {
                faceIndex: i,
                matchFound: false,
                subjectId: `CIV-${1000 + i}`,
                name: 'Unknown Civilian',
                riskLevel: 'None',
                confidence: 0
            };
        });

        analyticsData = {
            totalFaces: currentDetections.length,
            densityLevel: currentDetections.length > 5 ? 'High' : 'Low',
            estCrowdSize: Math.floor(currentDetections.length * 1.5) || 1
        };
      }

      setIdentifications(idResults);
      setAnalytics(analyticsData);

      // 3. Draw Results
      drawResults(currentDetections, idResults);

    } catch (err) {
      console.error("Critical Analysis Error", err);
      alert("Analysis failed. Please try a different image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const drawResults = (detections: any[], identities: any[]) => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !faceapi) return;

    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(canvas, displaySize);
    
    // Resize detections if they are real faceapi objects
    let resizedDetections = detections;
    if (detections.length > 0 && detections[0].detection) {
        resizedDetections = faceapi.resizeResults(detections, displaySize);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((det: any, i: number) => {
      const identity = identities[i];
      // Handle both faceapi detection objects and mock objects
      const box = det.detection ? det.detection.box : det.box || { x: 50, y: 50, width: 100, height: 100 };
      
      // Box Style
      ctx.lineWidth = 3;
      ctx.strokeStyle = identity?.matchFound ? '#ef4444' : '#22c55e'; // Red for match, Green for safe
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Label Background
      ctx.fillStyle = identity?.matchFound ? '#ef4444' : '#22c55e';
      const labelText = identity?.matchFound 
        ? `${identity.name} (${Math.round(identity.confidence * 100)}%)`
        : 'Unknown';
      
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(box.x, box.y - 25, textWidth + 10, 25);

      // Label Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(labelText, box.x + 5, box.y - 7);
    });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <ScanFace className="text-blue-600" /> Visual Intelligence
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Crowd scanning and automated suspect identification against synthetic watchlists.
          </p>
        </div>
        <div className="flex gap-2">
           <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">
             Demo Mode: Synthetic Data
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* LEFT: Analysis Canvas */}
        <div className="lg:col-span-3 bg-black rounded-xl border border-slate-700 overflow-hidden flex flex-col relative group">
           {/* Toolbar */}
           <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition flex items-center gap-2 border border-white/20"
              >
                <Upload size={16} /> Upload Feed
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              
              {image && (
                <button 
                  onClick={runAnalysis}
                  disabled={analyzing || !modelsLoaded}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {analyzing ? 'Scanning...' : 'Run Analysis'} <ScanFace size={16} />
                </button>
              )}
           </div>

           {/* Canvas Area */}
           <div className="flex-1 relative flex items-center justify-center bg-slate-900">
              {!image ? (
                <div className="text-center text-slate-500">
                  <Maximize2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Upload a crowd image or surveillance frame to begin.</p>
                </div>
              ) : (
                <div className="relative max-w-full max-h-full">
                   <img 
                     ref={imageRef} 
                     src={image} 
                     alt="Analysis Target" 
                     className="max-h-[600px] w-auto object-contain"
                   />
                   <canvas 
                     ref={canvasRef} 
                     className="absolute top-0 left-0 w-full h-full pointer-events-none"
                   />
                </div>
              )}
           </div>

           {/* Footer Stats (Overlay) */}
           {analytics && (
             <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 p-4 flex justify-around text-white">
                <div className="text-center">
                   <div className="text-xs text-slate-400 uppercase font-bold">Faces Detected</div>
                   <div className="text-2xl font-bold">{analytics.totalFaces}</div>
                </div>
                <div className="text-center">
                   <div className="text-xs text-slate-400 uppercase font-bold">Crowd Density</div>
                   <div className={`text-2xl font-bold ${
                     analytics.densityLevel === 'High' ? 'text-red-500' : 'text-emerald-500'
                   }`}>{analytics.densityLevel}</div>
                </div>
                <div className="text-center">
                   <div className="text-xs text-slate-400 uppercase font-bold">Est. Crowd Size</div>
                   <div className="text-2xl font-bold">~{analytics.estCrowdSize}</div>
                </div>
             </div>
           )}
        </div>

        {/* RIGHT: Watchlist & Alerts */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
           
           {/* Active Watchlist */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-1/2">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-bold text-navy-900 dark:text-white text-sm flex items-center gap-2">
                   <ShieldAlert size={16} className="text-red-500" /> Active Watchlist
                 </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                 {watchlist.map((suspect: any) => (
                   <div key={suspect.id} className="flex items-center gap-3 p-2 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <img src={suspect.image} alt="Suspect" className="w-10 h-10 rounded bg-slate-200 object-cover" />
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between">
                           <span className="font-bold text-xs text-navy-900 dark:text-white truncate">{suspect.name}</span>
                           <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                             suspect.risk === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                           }`}>{suspect.risk}</span>
                         </div>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{suspect.crime}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Analysis Results Log */}
           <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-1/2">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                 <h3 className="font-bold text-navy-900 dark:text-white text-sm flex items-center gap-2">
                   <Activity size={16} className="text-blue-500" /> Detection Log
                 </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                 {identifications.length === 0 ? (
                   <div className="p-6 text-center text-slate-400 text-xs">
                     {analyzing ? 'Processing feed...' : 'Waiting for analysis...'}
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-100 dark:divide-slate-700">
                     {identifications.map((id, idx) => (
                       <div key={idx} className={`p-3 flex items-center gap-3 ${id.matchFound ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                          <div className={`p-1.5 rounded-full ${id.matchFound ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                             {id.matchFound ? <Target size={14} /> : <UserX size={14} />}
                          </div>
                          <div>
                             <p className={`text-xs font-bold ${id.matchFound ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                               {id.name}
                             </p>
                             <p className="text-[10px] text-slate-400">
                               {id.matchFound ? `Confidence: ${(id.confidence * 100).toFixed(0)}%` : 'No Database Record'}
                             </p>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default VisualIntelligence;

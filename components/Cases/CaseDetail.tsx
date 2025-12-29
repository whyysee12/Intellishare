import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Share2, 
  Activity, 
  ArrowRight,
  GitMerge,
  Lock, 
  BrainCircuit,
  FileText,
  Image as ImageIcon,
  Film,
  Download,
  Eye,
  Camera,
  KeyRound,
  Unlock,
  XCircle,
  CheckCircle,
  ShieldAlert,
  Clock,
  Sparkles,
  History,
  Edit3,
  Loader,
  Link2
} from 'lucide-react';
import { MOCK_CASES } from '../../data/mockData';
import { Case } from '../../types';
import NetworkGraph from '../Analytics/NetworkGraph'; // Kept for other uses if needed, but Related tab will use custom visual
import * as L from 'leaflet';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Evidence Security State
  const [isEvidenceUnlocked, setIsEvidenceUnlocked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'face' | 'password' | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // AI Brief State
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  const [briefContent, setBriefContent] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const found = MOCK_CASES.find(c => c.id === id);
      setCaseData(found || null);
      // Reset brief on case change
      setBriefContent(null); 
    }
  }, [id]);

  // Leaflet Map Init for Overview
  useEffect(() => {
    if (activeTab === 'overview' && caseData && mapRef.current) {
        const container = L.DomUtil.get(mapRef.current);
        if(container != null){
          // @ts-ignore
          container._leaflet_id = null; 
        }

        const map = L.map(mapRef.current).setView([caseData.location.lat, caseData.location.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const icon = L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center animate-pulse"><div class="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div></div>`
        });

        L.marker([caseData.location.lat, caseData.location.lng], { icon }).addTo(map)
         .bindPopup(`<b>${caseData.id}</b><br>${caseData.location.address}`).openPopup();
         
        return () => { map.remove(); }
    }
  }, [activeTab, caseData]);

  // Auth Logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
      setTimeout(() => {
        handleAuthSuccess();
      }, 3000);
    } catch (err) {
      alert("Camera access failed. Using password fallback.");
      setAuthMode('password');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (authMode === 'face') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [authMode]);

  const handleAuthSuccess = () => {
    stopCamera();
    setIsEvidenceUnlocked(true);
    setShowAuthModal(false);
    setAuthMode(null);
  };

  const handleGenerateBrief = () => {
    if (briefContent) return; // Already generated
    setIsBriefLoading(true);
    
    // Simulate AI Latency
    setTimeout(() => {
        setBriefContent(`
            <div class="space-y-3">
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
                    <h4 class="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase mb-1">Executive Summary</h4>
                    <p class="text-sm text-purple-900 dark:text-purple-100">
                        Investigation into <strong>${caseData?.type}</strong> at <strong>${caseData?.location.city}</strong> shows high correlation with organized crime syndicate "Alpha". 
                        Suspect identification via CCTV has reached <strong>92% confidence</strong>.
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h4 class="text-xs font-bold text-slate-500 uppercase mb-1">Key Action Items</h4>
                        <ul class="list-disc pl-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                            <li>Issue warrant for Suspect A</li>
                            <li>Forensic analysis of Site B</li>
                            <li>Cross-check vehicle DL-8C...</li>
                        </ul>
                    </div>
                    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <h4 class="text-xs font-bold text-slate-500 uppercase mb-1">Risk Assessment</h4>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="text-2xl font-bold text-red-600">High</span>
                            <span class="text-xs text-slate-400">Flight Risk Detected</span>
                        </div>
                    </div>
                </div>
            </div>
        `);
        setIsBriefLoading(false);
    }, 2000);
  };

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <p>Case not found or access denied.</p>
        <button onClick={() => navigate('/cases')} className="mt-4 text-navy-600 font-bold hover:underline">Return to Case List</button>
      </div>
    );
  }

  // Mock Data Generators
  const relatedCases = MOCK_CASES.filter(c => c.type === caseData.type && c.id !== caseData.id).slice(0, 3);
  
  const timelineEvents = [
    { date: caseData.date, time: '09:30 AM', title: 'Case Registered', type: 'start', user: 'System' },
    { date: caseData.date, time: '10:15 AM', title: 'IO Assigned', type: 'admin', user: 'Admin' },
    { date: caseData.date, time: '02:00 PM', title: 'Evidence Collected (Scene)', type: 'evidence', user: caseData.assignedOfficer },
    { date: 'Next Day', time: '11:00 AM', title: 'Suspect Identified via CCTV', type: 'intel', user: 'AI Analysis' },
    { date: 'Next Day', time: '04:30 PM', title: 'Warrant Requested', type: 'legal', user: caseData.assignedOfficer },
  ];

  const evidenceFiles = [
    { id: 'ev1', name: 'CCTV_Main_Gate.mp4', type: 'video', size: '45 MB', date: '12 Mar 2024' },
    { id: 'ev2', name: 'Forensic_Report_A.pdf', type: 'doc', size: '2.1 MB', date: '13 Mar 2024' },
    { id: 'ev3', name: 'Crime_Scene_Photo_01.jpg', type: 'image', size: '4.5 MB', date: '12 Mar 2024' },
    { id: 'ev4', name: 'Suspect_Call_Logs.csv', type: 'doc', size: '128 KB', date: '14 Mar 2024' },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/cases" className="text-slate-400 hover:text-navy-600 dark:hover:text-blue-400 transition flex items-center gap-1 text-xs font-bold uppercase">
              <ArrowLeft size={14} /> Back to Registry
            </Link>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{caseData.id}</span>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            {caseData.title}
            <span className={`text-xs px-2 py-1 rounded-full border ${
               caseData.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {caseData.status}
            </span>
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button 
             onClick={() => navigate(`/analytics/${caseData.id}`)}
             className="bg-purple-600 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-purple-700 transition shadow-sm flex items-center gap-2"
          >
            <BrainCircuit size={16} /> AI Analysis
          </button>
          <button className="bg-navy-800 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-navy-700 transition shadow-sm flex items-center gap-2">
            <Share2 size={16} /> Share Case
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {/* REMOVED CONTINUITY TAB as requested */}
        {['Overview', 'Evidence', 'Timeline', 'Related'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.toLowerCase() 
                ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
                : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
             {/* 1. AI Brief Banner */}
             <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-all">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-lg">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-navy-900 dark:text-white text-sm">AI Case Intelligent Brief</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {briefContent ? 'Analysis Complete. See summary below.' : 'Click generate to create an AI-powered executive summary using the Neural Intelligence Engine.'}
                            </p>
                        </div>
                    </div>
                    {!briefContent && (
                        <button 
                            onClick={handleGenerateBrief}
                            disabled={isBriefLoading}
                            className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-2 rounded-md text-xs font-bold hover:bg-purple-100 transition flex items-center gap-2 disabled:opacity-70"
                        >
                            {isBriefLoading ? <Loader size={14} className="animate-spin" /> : <BrainCircuit size={14} />} 
                            {isBriefLoading ? 'Analyzing...' : 'Generate Brief'}
                        </button>
                    )}
                </div>
                
                {/* Generated Content Area */}
                {briefContent && (
                    <div className="mt-4 pt-4 border-t border-purple-100 dark:border-slate-700 animate-fade-in">
                        <div dangerouslySetInnerHTML={{ __html: briefContent }} />
                    </div>
                )}
             </div>

             {/* 2. Investigation Summary Card */}
             <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-3">
                   <FileText size={16} className="text-blue-500" /> Investigation Summary
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
                   {caseData.description} This investigation was initiated following reports of suspicious activity in the {caseData.location.city} region. Preliminary findings suggest involvement of an organized group. Multiple entities have been tagged for further surveillance. Forensic teams have collected initial samples from the incident site.
                </p>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                   <div className="text-center">
                      <div className="text-2xl font-bold text-navy-900 dark:text-white">4</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Suspects</div>
                   </div>
                   <div className="text-center border-l border-slate-100 dark:border-slate-700">
                      <div className="text-2xl font-bold text-navy-900 dark:text-white">12</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Evidence Files</div>
                   </div>
                   <div className="text-center border-l border-slate-100 dark:border-slate-700">
                      <div className="text-2xl font-bold text-navy-900 dark:text-white">85%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Solve Probability</div>
                   </div>
                </div>
             </div>

             {/* 3. Map & Report Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Map */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden h-[400px] relative">
                   <div className="absolute top-4 left-4 z-[400] bg-white dark:bg-slate-800 px-3 py-1.5 rounded shadow-md border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-xs font-bold text-navy-900 dark:text-white">Real-time Location</span>
                   </div>
                   <div ref={mapRef} className="w-full h-full bg-slate-100 dark:bg-slate-900"></div>
                </div>

                {/* Report Editor & History */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                   {/* Editor */}
                   <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex-1 flex flex-col">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                         <div className="flex gap-2">
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><Edit3 size={14} /></button>
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500 font-serif font-bold">B</button>
                            <button className="p-1 hover:bg-slate-200 rounded text-slate-500 italic">I</button>
                         </div>
                         <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Sarah is typing...</span>
                      </div>
                      <div className="p-4 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed overflow-y-auto max-h-[200px]">
                         <p className="font-bold mb-2">Initial Investigation Report:</p>
                         <p className="mb-2">1. Preliminary Observation:</p>
                         <p className="mb-4 text-slate-500">Subject identified via CCTV surveillance at Sector 4. Facial recognition confidence: 92%.</p>
                         <p className="mb-2">2. Action Taken:</p>
                         <p className="mb-4 text-slate-500">Surveillance team Alpha deployed to monitor movements. Inter-agency request sent to Traffic Department for vehicle tracking.</p>
                         <p className="mb-2">3. Pending Items:</p>
                         <ul className="list-disc pl-4 text-slate-500">
                            <li>Collect forensic samples from site B</li>
                            <li>Interview primary witness (Mrs. Sharma)</li>
                            <li>Cross-reference financial records</li>
                         </ul>
                      </div>
                   </div>

                   {/* Version History */}
                   <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2 mb-3">
                         <History size={14} /> Version History
                      </h4>
                      <div className="space-y-3">
                         <div className="flex gap-3">
                            <div className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded h-fit font-bold text-slate-600">v1.2</div>
                            <div>
                               <div className="text-xs font-bold text-navy-900 dark:text-white">Officer Rajesh Kumar</div>
                               <div className="text-[10px] text-slate-400">12 Mar 2024, 14:30</div>
                               <div className="text-[10px] text-slate-500 italic mt-0.5">"Updated pending items list..."</div>
                            </div>
                         </div>
                         <div className="flex gap-3">
                            <div className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded h-fit font-bold text-slate-600">v1.1</div>
                            <div>
                               <div className="text-xs font-bold text-navy-900 dark:text-white">Analyst Sarah</div>
                               <div className="text-[10px] text-slate-400">11 Mar 2024, 09:15</div>
                               <div className="text-[10px] text-slate-500 italic mt-0.5">"Added facial recognition results..."</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- EVIDENCE TAB --- */}
        {activeTab === 'evidence' && (
           <div className="min-h-[400px]">
             {!isEvidenceUnlocked ? (
               <div className="flex flex-col items-center justify-center h-full py-16 text-center animate-fade-in bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-4">
                 <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <Lock size={40} className="text-slate-400 dark:text-slate-500" />
                 </div>
                 <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-2">Restricted Evidence Vault</h3>
                 <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                   This case contains sensitive digital evidence including CCTV footage and forensic reports. 
                   Chain-of-custody protocols require identity verification to access.
                 </p>
                 <button 
                   onClick={() => setShowAuthModal(true)}
                   className="bg-navy-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-navy-700 transition flex items-center gap-2"
                 >
                   <Unlock size={18} /> Request Secure Access
                 </button>
               </div>
             ) : (
               <div className="animate-fade-in mt-6">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                     <ShieldAlert size={20} className="text-emerald-500" /> ESAKYA Evidence Locker
                   </h3>
                   <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                     <CheckCircle size={12} /> Access Granted
                   </span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {evidenceFiles.map((file) => (
                     <div key={file.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-3 rounded-lg ${
                            file.type === 'video' ? 'bg-red-100 text-red-600' : 
                            file.type === 'image' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {file.type === 'video' ? <Film size={24} /> : file.type === 'image' ? <ImageIcon size={24} /> : <FileText size={24} />}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><Eye size={16} /></button>
                            <button className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500"><Download size={16} /></button>
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-navy-900 dark:text-white truncate" title={file.name}>{file.name}</h4>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{file.size}</span>
                          <span>{file.date}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        )}

        {/* --- TIMELINE TAB --- */}
        {activeTab === 'timeline' && (
          <div className="py-6 px-4 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-8 border-b border-slate-200 pb-2">Investigative Chronology</h3>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 space-y-8 pl-8">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${
                    event.type === 'start' ? 'bg-emerald-500' : 
                    event.type === 'evidence' ? 'bg-purple-500' :
                    event.type === 'intel' ? 'bg-blue-500' :
                    event.type === 'legal' ? 'bg-red-500' : 'bg-slate-400'
                  } shadow-sm group-hover:scale-125 transition-transform`}></div>
                  
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{event.date} • {event.time}</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-medium mt-1 sm:mt-0 w-fit">
                        User: {event.user}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-navy-900 dark:text-white">{event.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- RELATED TAB (Redesigned with Connection Map) --- */}
        {activeTab === 'related' && (
           <div className="space-y-6 mt-6">
              
              {/* AI Correlation Analysis Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 flex gap-3">
                 <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full h-fit text-blue-600 dark:text-blue-300">
                    <Link2 size={16} className="rotate-45" /> {/* Mock link icon using Link from lucide not available, using GitMerge or simple div */}
                    <GitMerge size={16} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-navy-900 dark:text-white">AI Correlation Analysis</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                       The system has detected <span className="font-bold text-navy-900 dark:text-white">{relatedCases.length} other cases</span> with high similarity. 
                       Primary correlation factors identified: <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">Modus Operandi</span> and <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">Geolocation</span>.
                    </p>
                 </div>
              </div>

              {/* CONNECTION MAP VISUALIZATION */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden min-h-[400px]">
                 <h3 className="text-xs font-bold text-slate-500 uppercase mb-8">CONNECTION MAP</h3>
                 
                 <div className="relative h-[300px] w-full flex items-center justify-center">
                    
                    {/* SVG Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                       {relatedCases.map((_, i) => {
                          // Simple radial layout calc
                          const angle = (i / relatedCases.length) * Math.PI + Math.PI; // Semicircle top
                          const x = 50 + 30 * Math.cos(angle); // %
                          const y = 50 + 40 * Math.sin(angle); // %
                          return (
                             <line 
                                key={i}
                                x1="50%" y1="60%" // Center Node Position approx
                                x2={`${i === 0 ? 50 : i === 1 ? 20 : 80}%`} 
                                y2="30%" 
                                stroke="#cbd5e1" 
                                strokeWidth="2" 
                                strokeDasharray="5,5" 
                             />
                          );
                       })}
                    </svg>

                    {/* Center Node (Current Case) */}
                    <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                       <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl">
                          <FileText className="text-white" size={24} />
                       </div>
                       <div className="mt-2 text-center bg-navy-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                          CURRENT<br/>{caseData.id}
                       </div>
                    </div>

                    {/* Related Nodes */}
                    {relatedCases.map((rc, i) => {
                       // Positioning logic for 3 items: Left, Center-Top, Right
                       const positions = [
                          { top: '20%', left: '50%', transform: 'translateX(-50%)' },
                          { top: '30%', left: '20%', transform: 'translateX(0)' },
                          { top: '30%', right: '20%', transform: 'translateX(0)' }
                       ];
                       const pos = positions[i] || positions[0];

                       return (
                          <div 
                             key={rc.id}
                             className="absolute z-10 bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg w-48 hover:scale-105 transition-transform cursor-pointer"
                             style={pos}
                             onClick={() => navigate(`/cases/${rc.id}`)}
                          >
                             <div className="text-xs font-bold text-navy-700 dark:text-blue-300 mb-1">{rc.id}</div>
                             <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-2">{rc.title}</div>
                             <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded text-center">
                                {80 + i*5}% Match
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* Case Relationships List */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Case Relationships</h3>
                <div className="space-y-3">
                  {relatedCases.length > 0 ? relatedCases.map((relatedCase, idx) => (
                      <div key={relatedCase.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-navy-300 transition-colors group">
                        {/* Left Side Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-navy-700 dark:text-blue-400">{relatedCase.id}</span>
                              <span className="text-xs text-slate-400">• {relatedCase.date}</span>
                            </div>
                            <h4 className="font-bold text-navy-900 dark:text-white text-base mb-1">{relatedCase.title}</h4>
                            <div className="flex gap-2">
                               <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{relatedCase.type}</span>
                               <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{relatedCase.location.city}</span>
                            </div>
                        </div>

                        {/* Right Side Match & Action */}
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-2 flex items-center gap-3">
                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-600">
                                   <ShieldAlert size={16} className="text-blue-500" />
                                </div>
                                <div>
                                   <div className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2">
                                      Connection: Modus Operandi Match <span className="text-emerald-600">{80 + idx*5}%</span>
                                   </div>
                                   <div className="text-[10px] text-slate-500">Similar entry method (Lock Picking)</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/cases/${relatedCase.id}`)}
                                className="p-2 text-slate-400 hover:text-navy-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
                                title="View Case File"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                      </div>
                  )) : (
                    <div className="p-8 text-center text-slate-500 italic bg-slate-50 rounded border border-slate-200">No related cases found with similar patterns.</div>
                  )}
                </div>
              </div>
           </div>
        )}

      </div>

      {/* --- AUTH MODAL (Preserved) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden relative">
              <button 
                onClick={() => { setShowAuthModal(false); stopCamera(); setAuthMode(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1 bg-black/20 rounded-full"
              >
                <XCircle size={20} />
              </button>

              {!authMode && (
                <div className="p-8 text-center">
                   <div className="w-16 h-16 bg-navy-50 dark:bg-navy-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ShieldAlert size={32} className="text-navy-600 dark:text-blue-400" />
                   </div>
                   <h3 className="font-bold text-xl text-navy-900 dark:text-white mb-2">Verify Identity</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                     Accessing CCTNS/ESAKYA evidence requires elevated clearance verification.
                   </p>
                   <div className="space-y-3">
                     <button 
                       onClick={() => setAuthMode('face')}
                       className="w-full bg-navy-800 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-navy-700 transition flex items-center justify-center gap-2"
                     >
                       <Camera size={18} /> Face Verification
                     </button>
                     <button 
                       onClick={() => setAuthMode('password')}
                       className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white py-3 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                     >
                       <KeyRound size={18} /> Enter PIN
                     </button>
                   </div>
                </div>
              )}

              {authMode === 'face' && (
                <div className="flex flex-col h-[400px]">
                   <div className="relative flex-1 bg-black overflow-hidden">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                      />
                      <div className="absolute inset-0 border-[30px] border-black/50 rounded-xl z-10 pointer-events-none"></div>
                      
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                           <div className="w-48 h-48 border-2 border-emerald-500/50 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-scan"></div>
                              <div className="absolute bottom-2 left-0 w-full text-center">
                                <span className="bg-black/60 text-emerald-400 text-[10px] px-2 py-1 rounded font-mono">VERIFYING OFFICER...</span>
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                   <div className="p-4 bg-slate-900 text-white text-center">
                      <h3 className="font-bold text-lg mb-1">Face Verification</h3>
                      <p className="text-xs text-slate-400">Align your face within the frame.</p>
                   </div>
                </div>
              )}

              {authMode === 'password' && (
                <div className="p-8">
                   <div className="text-center mb-6">
                     <div className="w-16 h-16 bg-navy-50 dark:bg-navy-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <KeyRound size={32} className="text-navy-600 dark:text-blue-400" />
                     </div>
                     <h3 className="font-bold text-xl text-navy-900 dark:text-white">Enter Security PIN</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Officer authorization code required.</p>
                   </div>
                   <form onSubmit={(e) => { e.preventDefault(); if(passwordInput.length > 3) handleAuthSuccess(); }}>
                     <input 
                       type="password" 
                       autoFocus
                       className="w-full text-center text-2xl tracking-[0.5em] font-bold py-3 border-b-2 border-slate-300 dark:border-slate-600 bg-transparent focus:border-navy-600 focus:outline-none dark:text-white mb-6"
                       placeholder="••••"
                       maxLength={6}
                       value={passwordInput}
                       onChange={(e) => setPasswordInput(e.target.value)}
                     />
                     <button 
                       type="submit"
                       className="w-full bg-navy-800 text-white py-3 rounded-lg font-bold hover:bg-navy-700 transition shadow-lg flex items-center justify-center gap-2"
                     >
                       <Unlock size={18} /> Verify Identity
                     </button>
                   </form>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
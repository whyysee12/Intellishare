import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import * as L from 'leaflet';
import { MOCK_CASES, AGENCIES, DEMO_USERS } from '../../data/mockData';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Clock, 
  FileText, 
  Paperclip, 
  Share2, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  Link as LinkIcon,
  Phone,
  Car,
  Users,
  Save,
  History,
  Bold,
  Italic,
  Underline,
  List,
  Type,
  RotateCcw,
  X,
  Lock,
  Eye,
  Sparkles,
  Loader,
  Layers
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Case } from '../../types';

// Fix for default marker icon in leaflet with webpack/react
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState({
    selectedAgencies: [] as string[],
    permission: 'View Only',
    expiration: '',
    reason: ''
  });

  // Notes State
  const [currentNote, setCurrentNote] = useState(`Initial Investigation Report:
  
1. Preliminary Observation:
Subject identified via CCTV surveillance at Sector 4. Facial recognition confidence: 92%.

2. Action Taken:
Surveillance team Alpha deployed to monitor movements. Inter-agency request sent to Traffic Department for vehicle tracking.

3. Pending Items:
- Collect forensic samples from site B
- Interview primary witness (Mrs. Sharma)
- Cross-reference financial records`);
  
  const [noteHistory, setNoteHistory] = useState([
    { version: '1.2', date: '12 Mar 2024, 14:30', author: 'Officer Rajesh Kumar', content: 'Updated pending items list.' },
    { version: '1.1', date: '11 Mar 2024, 09:15', author: 'Analyst Sarah', content: 'Added facial recognition results.' },
    { version: '1.0', date: '10 Mar 2024, 10:00', author: 'Officer Rajesh Kumar', content: 'Initial draft created.' },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // --- Dynamic Case Handling ---
  const [caseData, setCaseData] = useState<Case | undefined>(undefined);

  useEffect(() => {
    // 1. Try to find existing case
    const existing = MOCK_CASES.find(c => c.id === id);
    if (existing) {
      setCaseData(existing);
    } else if (location.state && location.state.generateNew && id) {
      // 2. Generate a "Shadow Record" if passed via state
      const { entityName, entityType } = location.state;
      
      const newCase: Case = {
        id: id,
        title: `Investigation regarding ${entityName}`,
        description: `Auto-generated case file initiated due to suspicious activity linked to ${entityName}. This is a provisional shadow record created for immediate intelligence tracking.`,
        type: entityType === 'Vehicle' ? 'Traffic Violation' : 'Surveillance',
        status: 'Under Investigation',
        date: new Date().toISOString().split('T')[0],
        location: {
           lat: 26.9124, 
           lng: 75.7873,
           city: 'Jaipur',
           address: 'Sector 4, Malviya Nagar'
        },
        priority: 'Medium',
        assignedOfficer: 'Officer Rajesh Kumar',
        entities: [
          { id: 'e-gen-1', type: entityType || 'Person', value: entityName },
          { id: 'e-gen-2', type: 'Location', value: 'Jaipur Safehouse' }
        ],
        similarityScore: 0
      };
      setCaseData(newCase);
    }
  }, [id, location.state]);


  // Simulation of real-time collaboration
  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    
    if (activeTab === 'notes') {
        // Simulate a colleague joining
        timers.push(setTimeout(() => {
            const analyst = DEMO_USERS.find(u => u.role === 'Analyst') || { name: 'Analyst Sarah', role: 'Analyst' };
            setCollaborators([analyst]);
        }, 1500));

        // Simulate another joining
        timers.push(setTimeout(() => {
            setCollaborators(prev => [
                ...prev, 
                { id: 'temp-admin', name: 'ACP Vikram Singh', role: 'Administrator', avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=0D8ABC&color=fff' }
            ]);
        }, 4500));
    } else {
        setCollaborators([]);
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [activeTab]);

  // Initialize Map when Overview tab is active
  useEffect(() => {
    if (activeTab === 'overview' && mapContainerRef.current && !mapRef.current && caseData) {
      const { lat, lng } = caseData.location;
      
      // Create Map
      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 14);

      // Add Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add Marker
      const marker = L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-1">
            <h3 class="font-bold text-sm text-navy-900 mb-1">${caseData.id}</h3>
            <p class="text-xs text-slate-600">${caseData.location.address}</p>
            <span class="inline-block mt-1 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Incident Location</span>
          </div>
        `)
        .openPopup();

      // Add Geofence Circle
      L.circle([lat, lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.1,
        radius: 300 // 300 meters radius
      }).addTo(mapRef.current);
    }

    // Cleanup on unmount or tab switch
    return () => {
      if (activeTab !== 'overview' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, caseData]);

  const generateCaseSummary = async () => {
    if (!caseData) return;
    setIsGeneratingSummary(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Role: Senior Police Intelligence Analyst.
        Task: Create a concise executive summary of the following case for a briefing.
        Format: Return ONLY a bulleted list (using '- '). Do not use asterisks or other formatting.
        Content Requirements:
        - Briefly state the core incident.
        - List key suspects and entities involved.
        - Highlight priority level, location context, and current status.
        - Mention any critical implications.

        Case Data:
        Title: ${caseData.title}
        Description: ${caseData.description}
        Type: ${caseData.type}
        Status: ${caseData.status}
        Priority: ${caseData.priority}
        Location: ${caseData.location.city}
        Entities: ${JSON.stringify(caseData.entities)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiSummary(response.text);
    } catch (err) {
      console.error(err);
      alert("Unable to generate summary at this time. Check API configuration.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <AlertTriangle size={48} className="mb-4 text-amber-500" />
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Case File Not Found</h2>
        <p className="mb-6">The requested case ID does not exist or you lack permission to view it.</p>
        <button 
          onClick={() => navigate('/cases')}
          className="px-4 py-2 bg-navy-800 text-white rounded-md hover:bg-navy-700 transition"
        >
          Return to Case List
        </button>
      </div>
    );
  }

  // Mock data for extended details not in the main list object
  const timeline = [
    { date: '2024-03-10 09:30', title: 'FIR Registered', desc: 'Case file opened by Officer Rajesh Kumar.', type: 'start' },
    { date: '2024-03-11 14:15', title: 'Evidence Collected', desc: 'CCTV footage retrieved from sector market.', type: 'evidence' },
    { date: '2024-03-12 11:00', title: 'Suspect Identified', desc: 'Facial recognition matched suspect from CCTV.', type: 'suspect' },
    { date: '2024-03-14 16:45', title: 'Witness Statement', desc: 'Primary witness statement recorded.', type: 'info' },
  ];

  const evidence = [
    { name: 'CCTV_Cam4_Footage.mp4', type: 'Video', size: '450 MB', date: '11 Mar 2024' },
    { name: 'Forensic_Report_A.pdf', type: 'Document', size: '2.4 MB', date: '13 Mar 2024' },
    { name: 'Crime_Scene_Photo_01.jpg', type: 'Image', size: '4.1 MB', date: '11 Mar 2024' },
    { name: 'Witness_Statement_Audio.wav', type: 'Audio', size: '12 MB', date: '14 Mar 2024' },
  ];
  
  // Get related cases for the view
  const relatedCases = MOCK_CASES.filter(c => c.id !== id).slice(0, 3);

  const handleSaveNote = () => {
    setIsSaving(true);
    setTimeout(() => {
      const newVersion = {
        version: (parseFloat(noteHistory[0].version) + 0.1).toFixed(1),
        date: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        author: 'Current User', 
        content: currentNote
      };
      setNoteHistory([newVersion, ...noteHistory]);
      setIsSaving(false);
    }, 800);
  };

  const handleShareSubmit = () => {
    if (shareConfig.selectedAgencies.length === 0) {
      alert("Please select at least one agency.");
      return;
    }
    alert(`Case ${caseData.id} successfully shared with ${shareConfig.selectedAgencies.length} agencies.`);
    setIsShareModalOpen(false);
    setShareConfig({
        selectedAgencies: [],
        permission: 'View Only',
        expiration: '',
        reason: ''
    });
  };

  const toggleAgency = (agency: string) => {
    setShareConfig(prev => {
        const selected = prev.selectedAgencies.includes(agency)
            ? prev.selectedAgencies.filter(a => a !== agency)
            : [...prev.selectedAgencies, agency];
        return { ...prev, selectedAgencies: selected };
    });
  };

  const applyFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let formattedText = '';
    
    switch(format) {
        case 'bold':
            formattedText = `**${selectedText || 'bold text'}**`;
            break;
        case 'italic':
            formattedText = `_${selectedText || 'italic text'}_`;
            break;
        case 'underline':
            formattedText = `__${selectedText || 'underlined text'}__`;
            break;
        case 'list':
            formattedText = `\n- ${selectedText || 'list item'}`;
            break;
        case 'heading':
            formattedText = `\n### ${selectedText || 'Heading'}`;
            break;
        default:
            return;
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end);
    setCurrentNote(newText);
    
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <div className="flex items-center gap-2">
             <span className="font-mono text-xs font-bold text-slate-400">CASE ID: {caseData.id}</span>
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
               caseData.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
               caseData.status === 'Under Investigation' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
               'bg-slate-100 text-slate-600 border-slate-200'
             }`}>
               {caseData.status}
             </span>
             {caseData.priority === 'High' && (
               <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400">
                 High Priority
               </span>
             )}
           </div>
           <h1 className="text-xl font-bold text-navy-900 dark:text-white mt-1">{caseData.title}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
             <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-navy-800 text-white rounded-md text-sm font-medium hover:bg-navy-700 transition shadow-sm">
             <Edit size={16} /> Update Status
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Info (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Key Details</h3>
              <div className="space-y-4">
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Assigned Officer</label>
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center text-navy-700 dark:text-blue-400">
                        <Shield size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{caseData.assignedOfficer}</span>
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Crime Category</label>
                   <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                     <AlertTriangle size={14} className="text-slate-400" /> {caseData.type}
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Date & Time</label>
                   <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                     <Calendar size={14} className="text-slate-400" /> {caseData.date}
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">Jurisdiction</label>
                   <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
                     <MapPin size={14} className="text-slate-400" /> {caseData.location.city}
                   </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Involved Entities</h3>
              <div className="space-y-3">
                 {caseData.entities.map((entity, i) => (
                   <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-100 dark:border-slate-600">
                      <div className={`p-1.5 rounded-full ${
                        entity.type === 'Person' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        entity.type === 'Vehicle' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                      }`}>
                        {entity.type === 'Person' && <User size={14} />}
                        {entity.type === 'Vehicle' && <Car size={14} />}
                        {entity.type === 'Phone' && <Phone size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{entity.value}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{entity.type}</p>
                      </div>
                   </div>
                 ))}
                 <button className="w-full text-xs text-navy-600 dark:text-blue-400 font-bold hover:underline py-1">
                   View Link Analysis Graph
                 </button>
              </div>
           </div>
        </div>

        {/* Center Content (9 cols) */}
        <div className="lg:col-span-9">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
            {['overview', 'timeline', 'evidence', 'related', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 border-b-2 font-bold text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400'
                    : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'notes' ? 'Investigation Notes' : tab}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* AI Summary Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
                          <Sparkles size={20} className="text-purple-600" /> AI Case Intelligent Brief
                      </h3>
                      {!aiSummary && (
                          <button 
                              onClick={generateCaseSummary}
                              disabled={isGeneratingSummary}
                              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-bold hover:bg-purple-200 transition disabled:opacity-50 flex items-center gap-1"
                          >
                              {isGeneratingSummary ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {isGeneratingSummary ? 'Analyzing...' : 'Generate Brief'}
                          </button>
                      )}
                  </div>
                  
                  {aiSummary ? (
                      <div className="bg-purple-50 dark:bg-slate-700/50 p-4 rounded-lg border border-purple-100 dark:border-slate-600">
                          <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                               <ul className="list-disc pl-5 space-y-1">
                                  {aiSummary.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map((line, i) => (
                                      <li key={i} className="pl-1 leading-relaxed">{line.replace(/^[-*]\s*/, '')}</li>
                                  ))}
                               </ul>
                               {/* Fallback for unstructured text if API returns weird format */}
                               {(!aiSummary.includes('-') && !aiSummary.includes('*')) && (
                                   <p>{aiSummary}</p>
                               )}
                          </div>
                           <div className="mt-3 flex justify-end">
                              <button onClick={() => setAiSummary(null)} className="text-[10px] text-slate-400 hover:text-navy-600 underline">Regenerate</button>
                           </div>
                      </div>
                  ) : (
                      <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded border border-slate-100 dark:border-slate-700 border-dashed">
                          Click generate to create an AI-powered executive summary of all case entities, timeline events, and evidence using the Neural Intelligence Engine.
                      </p>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-navy-600 dark:text-blue-400" /> Investigation Summary
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {caseData.description} This investigation was initiated following reports of suspicious activity in the {caseData.location.city} region. 
                    Preliminary findings suggest involvement of an organized group. Multiple entities have been tagged for further surveillance.
                    Forensic teams have collected initial samples from the incident site.
                  </p>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-4 text-center">
                     <div>
                       <div className="text-2xl font-bold text-navy-900 dark:text-white">4</div>
                       <div className="text-xs text-slate-500 uppercase font-medium">Suspects</div>
                     </div>
                     <div>
                       <div className="text-2xl font-bold text-navy-900 dark:text-white">12</div>
                       <div className="text-xs text-slate-500 uppercase font-medium">Evidence Files</div>
                     </div>
                     <div>
                       <div className="text-2xl font-bold text-navy-900 dark:text-white">85%</div>
                       <div className="text-xs text-slate-500 uppercase font-medium">Solve Probability</div>
                     </div>
                  </div>
                </div>

                {/* Real-time Map Integration */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-96 relative">
                   <div className="absolute top-4 left-4 z-[400] bg-white dark:bg-slate-900 px-3 py-1.5 rounded shadow-md border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-navy-900 dark:text-white">Real-time Location</span>
                   </div>
                   <div className="absolute top-4 right-4 z-[400] bg-white dark:bg-slate-900 p-2 rounded shadow-md border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Layers size={16} className="text-slate-600 dark:text-slate-300" />
                   </div>
                   {/* Leaflet Map Container */}
                   <div ref={mapContainerRef} className="w-full h-full z-0"></div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in">
                <div className="relative border-l-2 border-slate-200 dark:border-slate-600 ml-3 space-y-8 pl-8 py-2">
                  {timeline.map((event, i) => (
                    <div key={i} className="relative group">
                      <div className={`absolute -left-[43px] top-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center ${
                        event.type === 'start' ? 'bg-navy-600' :
                        event.type === 'evidence' ? 'bg-orange-500' :
                        event.type === 'suspect' ? 'bg-red-500' : 'bg-slate-400'
                      }`}>
                         {event.type === 'start' && <FileText size={12} className="text-white" />}
                         {event.type === 'evidence' && <Paperclip size={12} className="text-white" />}
                         {event.type === 'suspect' && <User size={12} className="text-white" />}
                         {event.type === 'info' && <CheckCircle size={12} className="text-white" />}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                        <h4 className="font-bold text-navy-900 dark:text-white text-base">{event.title}</h4>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-3 rounded border border-slate-100 dark:border-slate-700 group-hover:border-navy-200 dark:group-hover:border-slate-500 transition-colors">
                        {event.desc}
                      </p>
                    </div>
                  ))}
                  
                  {/* Add Event Button */}
                  <div className="relative pt-4">
                     <div className="absolute -left-[39px] top-5 w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                     <button className="text-sm text-navy-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                       + Add Timeline Entry
                     </button>
                  </div>
                </div>
              </div>
            )}

            {/* EVIDENCE TAB */}
            {activeTab === 'evidence' && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">Digital Evidence Repository</h3>
                  <button className="px-3 py-1.5 bg-navy-800 text-white text-xs font-bold rounded hover:bg-navy-700">
                    Upload New
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {evidence.map((file, i) => (
                     <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer group">
                        <div className="flex items-start justify-between mb-3">
                           <div className={`p-2 rounded-lg ${
                             file.type === 'Video' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                             file.type === 'Image' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                             file.type === 'Audio' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                             'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                           }`}>
                             {file.type === 'Video' ? <Share2 size={20} /> : <Paperclip size={20} />}
                           </div>
                           <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>
                        </div>
                        <p className="text-sm font-bold text-navy-900 dark:text-white truncate group-hover:text-navy-600 dark:group-hover:text-blue-400 transition-colors">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploaded: {file.date}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
            
            {/* RELATED TAB */}
            {activeTab === 'related' && (
              <div className="space-y-6 animate-fade-in">
                 {/* AI Insight Header */}
                 <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg flex gap-3 text-sm text-indigo-800 dark:text-indigo-300 shadow-sm">
                    <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full h-fit">
                        <LinkIcon size={18} className="shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">AI Correlation Analysis</h4>
                      <p className="opacity-90">
                        The system has detected <strong>{relatedCases.length}</strong> other cases with high similarity. 
                        Primary correlation factors identified: <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-indigo-200 dark:border-indigo-700">Modus Operandi</span> and <span className="font-mono bg-white dark:bg-slate-900 px-1 rounded border border-indigo-200 dark:border-indigo-700">Geolocation</span>.
                      </p>
                    </div>
                 </div>

                 {/* Visual Graph Container */}
                 <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 self-start w-full border-b border-slate-100 dark:border-slate-700 pb-2">Connection Map</h4>
                    <div className="relative w-full max-w-lg h-64">
                       {/* SVG for connections */}
                       <svg className="absolute inset-0 w-full h-full pointer-events-none">
                         <defs>
                           <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                             <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                           </marker>
                         </defs>
                         {/* Lines to satellites */}
                         <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowhead)" />
                         <line x1="50%" y1="50%" x2="20%" y2="70%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowhead)" />
                         <line x1="50%" y1="50%" x2="80%" y2="70%" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowhead)" />
                         
                         {/* Connection Labels */}
                         <rect x="42%" y="28%" width="16%" height="8%" rx="4" fill="#f1f5f9" className="dark:fill-slate-700" />
                         <text x="50%" y="33%" textAnchor="middle" fontSize="10" fill="#64748b" className="dark:fill-slate-300 font-bold">Same MO</text>

                         <rect x="25%" y="55%" width="18%" height="8%" rx="4" fill="#f1f5f9" className="dark:fill-slate-700" />
                         <text x="34%" y="60%" textAnchor="middle" fontSize="10" fill="#64748b" className="dark:fill-slate-300 font-bold">Loc &lt; 1km</text>

                         <rect x="58%" y="55%" width="20%" height="8%" rx="4" fill="#f1f5f9" className="dark:fill-slate-700" />
                         <text x="68%" y="60%" textAnchor="middle" fontSize="10" fill="#64748b" className="dark:fill-slate-300 font-bold">Shared Suspect</text>
                       </svg>

                       {/* Central Node */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy-900 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl z-10">
                          <FileText size={20} className="mb-1" />
                          <span className="text-[10px] font-bold opacity-70">CURRENT</span>
                          <span className="text-xs font-bold">{caseData.id}</span>
                       </div>

                       {/* Satellite Nodes */}
                       {relatedCases.map((rc, i) => {
                          const positions = [
                            { top: '5%', left: '50%', transform: 'translateX(-50%)' },
                            { bottom: '10%', left: '10%' },
                            { bottom: '10%', right: '10%' }
                          ];
                          const pos = positions[i] || { top: '0', left: '0' };
                          
                          return (
                             <div key={rc.id} className="absolute bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 p-3 rounded-lg shadow-md w-40 text-center z-10 hover:border-navy-500 transition-colors cursor-pointer" style={pos}>
                                <div className="text-xs font-bold text-navy-700 dark:text-blue-400 mb-1">{rc.id}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-300 truncate">{rc.title}</div>
                                <div className="mt-1 inline-block bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 rounded">
                                  {80 + i * 5}% Match
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>

                 {/* Detailed List */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Case Relationships</h4>
                    {relatedCases.map((relatedCase, index) => {
                        const reasons = [
                            { label: 'Modus Operandi Match', detail: 'Similar entry method (Lock Picking)', icon: Shield },
                            { label: 'Geospatial Proximity', detail: 'Incidents within 1.2km radius', icon: MapPin },
                            { label: 'Shared Entity', detail: 'Suspect: Raj Malhotra linked to both', icon: Users }
                        ];
                        const reason = reasons[index % reasons.length];

                        return (
                           <div key={relatedCase.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                              <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                 {/* Case Info */}
                                 <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-bold text-navy-700 dark:text-blue-400 font-mono">{relatedCase.id}</span>
                                      <span className="text-xs text-slate-400">• {relatedCase.date}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">{relatedCase.title}</h4>
                                    <div className="flex gap-2 text-xs">
                                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">{relatedCase.type}</span>
                                       <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">{relatedCase.location.city}</span>
                                    </div>
                                 </div>

                                 {/* Connection Point Visual */}
                                 <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 min-w-[280px]">
                                    <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-600 text-navy-600 dark:text-blue-400">
                                       <reason.icon size={16} />
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Connection: {reason.label}</p>
                                       <p className="text-[10px] text-slate-500 dark:text-slate-400">{reason.detail}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                       <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">{80 + index * 5}%</span>
                                       <span className="text-[10px] text-slate-400">Similarity</span>
                                    </div>
                                 </div>
                                 
                                 {/* Action */}
                                 <div className="self-center">
                                    <button className="p-2 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-full transition">
                                        <ArrowRight size={20} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                    })}
                 </div>
              </div>
            )}

            {/* INVESTIGATION NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Editor Section */}
                <div className="md:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
                   {/* Toolbar */}
                   <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <div className="flex gap-1 pr-3 border-r border-slate-200 dark:border-slate-700">
                        <button onClick={() => applyFormat('bold')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition" title="Bold"><Bold size={16} /></button>
                        <button onClick={() => applyFormat('italic')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition" title="Italic"><Italic size={16} /></button>
                        <button onClick={() => applyFormat('underline')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition" title="Underline"><Underline size={16} /></button>
                      </div>
                      <div className="flex gap-1 px-3 border-r border-slate-200 dark:border-slate-700">
                        <button onClick={() => applyFormat('list')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition" title="Bullet List"><List size={16} /></button>
                        <button onClick={() => applyFormat('heading')} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition" title="Heading"><Type size={16} /></button>
                      </div>
                      
                      {/* Real-time Collaborators Section */}
                      <div className="ml-auto flex items-center gap-3 pr-2">
                        {collaborators.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">Viewing:</span>
                                    <div className="flex -space-x-2">
                                        {collaborators.map((c, i) => (
                                            <div key={i} className="relative group cursor-help">
                                                <img 
                                                    src={c.avatar || `https://ui-avatars.com/api/?name=${c.name.replace(' ', '+')}&background=random`} 
                                                    alt={c.name}
                                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                                                />
                                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-800"></span>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    {c.name} ({c.role})
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    {collaborators[0].name.split(' ')[0]} is typing...
                                </div>
                            </>
                        ) : (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                Offline Mode
                            </div>
                        )}
                      </div>
                   </div>
                   
                   {/* Text Area */}
                   <div className="flex-1 relative">
                     <textarea 
                       ref={textareaRef}
                       className="w-full h-full p-4 resize-none focus:outline-none text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 leading-relaxed font-sans font-medium"
                       placeholder="Enter detailed investigation notes here... Supports Markdown (*bold*, _italic_)"
                       value={currentNote}
                       onChange={(e) => setCurrentNote(e.target.value)}
                     />
                   </div>

                   {/* Footer */}
                   <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CheckCircle size={12} className="text-emerald-500" /> Auto-saved 2m ago
                      </span>
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-navy-800 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition shadow-sm text-sm font-bold disabled:opacity-70"
                      >
                        {isSaving ? 'Saving...' : <><Save size={16} /> Save Version</>}
                      </button>
                   </div>
                </div>

                {/* Version History Section */}
                <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                   <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <h4 className="font-bold text-navy-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <History size={16} /> Version History
                      </h4>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                      {noteHistory.map((ver, idx) => (
                        <div key={idx} className="p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer group">
                           <div className="flex justify-between items-start mb-1">
                              <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                v{ver.version}
                              </span>
                              <span className="text-[10px] text-slate-400">{ver.date}</span>
                           </div>
                           <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{ver.author}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic">
                             "{ver.content.substring(0, 60)}..."
                           </p>
                           <div className="mt-2 hidden group-hover:flex justify-end">
                              <button className="text-[10px] text-navy-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                                <RotateCcw size={10} /> Restore
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                     <p className="text-[10px] text-slate-400">
                       All notes are immutable and audit-logged.
                     </p>
                   </div>
                </div>
              </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Share2 size={20} className="text-navy-600 dark:text-blue-400" /> Share Case Securely
                    </h3>
                    <button 
                      onClick={() => setIsShareModalOpen(false)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-5 overflow-y-auto">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                       <Lock size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                       <div>
                         <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Confidential Sharing Protocol</p>
                         <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                           You are about to share Case <span className="font-mono font-bold">{caseData.id}</span>. 
                           All access logs are audited. Ensure strict need-to-know basis.
                         </p>
                       </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Recipient Agencies</label>
                      <div className="grid grid-cols-2 gap-2">
                        {AGENCIES.filter(a => a !== 'State Police').map(agency => ( // Mock filter to exclude current if needed
                          <label key={agency} className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-all ${
                            shareConfig.selectedAgencies.includes(agency) 
                              ? 'bg-navy-50 border-navy-500 text-navy-900 dark:bg-navy-900 dark:border-blue-400 dark:text-white' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={shareConfig.selectedAgencies.includes(agency)}
                              onChange={() => toggleAgency(agency)}
                              className="rounded text-navy-600 focus:ring-navy-600" 
                            />
                            <span className="text-sm font-medium">{agency}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Access Level</label>
                          <select 
                            value={shareConfig.permission}
                            onChange={(e) => setShareConfig({...shareConfig, permission: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-600 outline-none bg-white dark:bg-slate-700 dark:text-white"
                          >
                            <option>View Only</option>
                            <option>View + Comment</option>
                            <option>View + Edit (Restricted)</option>
                            <option>Full Collaboration</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Access Expiration</label>
                          <input 
                            type="date"
                            value={shareConfig.expiration}
                            onChange={(e) => setShareConfig({...shareConfig, expiration: e.target.value})}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-600 outline-none bg-white dark:bg-slate-700 dark:text-white"
                          />
                       </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reason for Sharing</label>
                      <textarea 
                        value={shareConfig.reason}
                        onChange={(e) => setShareConfig({...shareConfig, reason: e.target.value})}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-600 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        placeholder="Enter official reason for inter-agency request..."
                        rows={3}
                      ></textarea>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-b-lg flex justify-end gap-3">
                    <button 
                      onClick={() => setIsShareModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleShareSubmit}
                      className="px-6 py-2 bg-navy-800 text-white rounded-md text-sm font-bold hover:bg-navy-700 transition flex items-center gap-2"
                    >
                      Grant Access
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseDetail;
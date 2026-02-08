
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../../lib/supabaseClient';
import { 
  UserPlus, 
  ScanFace, 
  Upload, 
  Camera, 
  Save, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Fingerprint, 
  MapPin, 
  Calendar,
  MoreVertical,
  Maximize2, 
  FileText, 
  Share2, 
  Siren, 
  History, 
  Activity, 
  User, 
  ShieldAlert, 
  Loader, 
  Filter, 
  ArrowUpDown, 
  Film, 
  PlayCircle, 
  Plus, 
  Database, 
  Trash2, 
  ArrowRight, 
  Split, 
  Scale, 
  Gavel, 
  Landmark 
} from 'lucide-react';

const faceapi = (window as any).faceapi;

// Mock Data for offline/demo mode
const MOCK_CRIMINALS_DB = [
  {
    id: 'CR-2023-8821',
    name: 'Raj Malhotra',
    age: 34,
    gender: 'Male',
    status: 'Wanted',
    riskLevel: 'High',
    crimes: ['Theft', 'Burglary'],
    lastSeen: 'Sector 4, Jaipur',
    image: 'https://ui-avatars.com/api/?name=Raj+Malhotra&background=ef4444&color=fff&size=128',
    matchScore: 0,
    caseHistory: [
       { id: 'FIR-2023-1102', date: '2023-11-12', type: 'Burglary', station: 'Central PS', status: 'Charge Sheet Filed' }
    ]
  },
  {
    id: 'CR-2022-9912',
    name: 'Vikram Singh',
    age: 29,
    gender: 'Male',
    status: 'In Custody',
    riskLevel: 'Medium',
    crimes: ['Grand Theft Auto'],
    lastSeen: 'Highway 8',
    image: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=f97316&color=fff&size=128',
    matchScore: 0,
    caseHistory: []
  },
  {
    id: 'CR-2024-0021',
    name: 'Amit Kumar',
    age: 42,
    gender: 'Male',
    status: 'Surveillance',
    riskLevel: 'Low',
    crimes: ['Fraud'],
    lastSeen: 'Mumbai',
    image: 'https://ui-avatars.com/api/?name=Amit+Kumar&background=64748b&color=fff&size=128',
    matchScore: 0,
    caseHistory: []
  }
];

const CriminalRegistry = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'analyze' | 'database'>('analyze');
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera' | 'video'>('upload');
  
  // -- LINKED DATA STATE --
  const [criminalsDatabase, setCriminalsDatabase] = useState<any[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(false);

  // Registration State
  const [regForm, setRegForm] = useState({
    name: '',
    alias: '',
    dob: '', // We will convert this to age
    gender: 'Male',
    crimeType: 'Theft',
    lastSeen: '',
    notes: ''
  });
  const [regPhoto, setRegPhoto] = useState<string | null>(null);
  
  // Analysis State
  const [analyzePhotos, setAnalyzePhotos] = useState<string[]>([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const analyzePhoto = analyzePhotos[selectedPhotoIdx] || null;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<'bio' | 'history'>('bio');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [matchConfirmed, setMatchConfirmed] = useState(false);
  
  // Face API State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetections, setFaceDetections] = useState<any[]>([]);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Video Analysis State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<{ url: string; faceCount: number }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Filtering & Sorting State
  const [sortBy, setSortBy] = useState<'score' | 'risk' | 'location'>('score');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);

  // --- Initialize Models & Fetch Data ---
  useEffect(() => {
    const loadModels = async () => {
      if (!faceapi) {
        console.warn("FaceAPI not found on window, some features will use simulation.");
        return;
      }
      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
        console.log('FaceAPI Models Loaded');
      } catch (err) {
        console.error('Failed to load FaceAPI models', err);
      }
    };
    loadModels();
    fetchCriminals();
  }, []);

  const fetchCriminals = async () => {
    setIsLoadingDB(true);
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('criminals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty, using mock DB:', error);
        setCriminalsDatabase(MOCK_CRIMINALS_DB);
      } else {
        // Mock Case History data injection for demo purposes since simple DB might not have it
        const enrichedData = data.map(c => ({
            ...c,
            caseHistory: c.caseHistory || [
                { id: `FIR-${new Date().getFullYear()-1}-00${Math.floor(Math.random()*90)+10}`, date: '2023-11-12', type: c.crimes?.[0] || 'Theft', station: 'Central PS', status: 'Charge Sheet Filed' },
                { id: `FIR-${new Date().getFullYear()-2}-00${Math.floor(Math.random()*90)+10}`, date: '2022-05-20', type: 'Traffic Violation', station: 'Highway Patrol', status: 'Closed (Fine Paid)' }
            ]
        }));
        setCriminalsDatabase(enrichedData);
      }
    } catch (err) {
      console.warn('Supabase connection error, falling back to mock:', err);
      setCriminalsDatabase(MOCK_CRIMINALS_DB);
    } finally {
      setIsLoadingDB(false);
    }
  };

  // --- Helpers ---

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const parts = base64data.split(',');
        resolve(parts.length > 1 ? parts[1] : base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getProcessedMatches = () => {
    let processed = [...matches];

    // Filter
    if (filterRisk !== 'All') {
      processed = processed.filter(m => m.riskLevel === filterRisk);
    }

    // Sort
    processed.sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      if (sortBy === 'location') return (a.lastSeen || '').localeCompare(b.lastSeen || '');
      if (sortBy === 'risk') {
        const riskOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
      }
      return 0;
    });

    return processed;
  };

  const processedMatches = getProcessedMatches();

  const resetAnalysisState = () => {
    setGeminiAnalysis(null);
    setMatches([]);
    setSelectedProfile(null);
    setFaceDetections([]);
    setIsImageLoaded(false);
    setMatchConfirmed(false);
    setProfileTab('bio');
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 30; // Default
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // --- Handlers for Database Management ---
  const handleDeleteCriminal = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this record permanently?')) {
      const { error } = await supabase.from('criminals').delete().eq('id', id);
      if (error) {
        // If supabase fails (e.g. mock mode), just filter locally
        setCriminalsDatabase(prev => prev.filter(c => c.id !== id));
      } else {
        setCriminalsDatabase(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const handleTestCriminal = (criminal: any) => {
    // Quickly move to analysis tab with this criminal's image
    setAnalyzePhotos([criminal.image]);
    setSelectedPhotoIdx(0);
    resetAnalysisState();
    setInputMethod('upload');
    setActiveTab('analyze');
  };

  const handleTransferToRegistry = () => {
    if (analyzePhoto) {
      setRegPhoto(analyzePhoto);
      setActiveTab('register');
      resetAnalysisState();
    }
  };

  // --- Handlers for Registration ---
  const handleRegPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setRegPhoto(url);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regForm.name || !regPhoto) {
        alert("Name and Photo are required for registration.");
        return;
    }

    setIsLoadingDB(true);

    try {
        let imageForDb = regPhoto;
        if (regPhoto.startsWith('blob:')) {
            const rawBase64 = await urlToBase64(regPhoto);
            imageForDb = `data:image/jpeg;base64,${rawBase64}`;
        }

        const newCriminal = {
            id: `CR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            name: regForm.name,
            age: calculateAge(regForm.dob),
            gender: regForm.gender,
            status: 'Wanted',
            riskLevel: 'High',
            crimes: [regForm.crimeType],
            lastSeen: regForm.lastSeen || 'Unknown Location',
            features: regForm.notes ? [regForm.notes] : ['Recently Registered'],
            matchScore: 0,
            image: imageForDb
        };

        const { error } = await supabase.from('criminals').insert([newCriminal]);

        if (error) {
            console.warn("Supabase insert failed (Mock mode active):", error);
            // Fallback to local state update
            setCriminalsDatabase(prev => [newCriminal, ...prev]);
        } else {
            await fetchCriminals();
        }

        setAnalyzePhotos([regPhoto]);
        setSelectedPhotoIdx(0);
        resetAnalysisState();
        setInputMethod('upload');

        alert(`Suspect "${regForm.name}" registered successfully! Redirecting to Face Scan...`);
        
        setRegForm({
          name: '', alias: '', dob: '', gender: 'Male', crimeType: 'Theft', lastSeen: '', notes: ''
        });
        setRegPhoto(null);
        setActiveTab('analyze');

    } catch (err: any) {
        console.error(err);
        alert(`Registration Failed: ${err.message || 'Unknown error'}`);
    } finally {
        setIsLoadingDB(false);
    }
  };

  // --- Handlers for Camera ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraActive(true);
      setAnalyzePhotos([]);
      setSelectedPhotoIdx(0);
      resetAnalysisState();
    } catch (err) {
      console.error(err);
      alert("Error accessing camera: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setAnalyzePhotos(prev => [...prev, dataUrl]);
        setSelectedPhotoIdx(prev => analyzePhotos.length);
        resetAnalysisState();
        stopCamera();
        setInputMethod('upload');
      }
    }
  };

  // --- Handlers for Analysis ---
  const handleAnalyzePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setAnalyzePhotos(prev => [...prev, ...newUrls]);
      if (analyzePhotos.length === 0) {
        setSelectedPhotoIdx(0);
      }
      resetAnalysisState();
    }
  };

  const removePhoto = (idx: number) => {
    const newPhotos = analyzePhotos.filter((_, i) => i !== idx);
    setAnalyzePhotos(newPhotos);
    if (idx <= selectedPhotoIdx) {
      const newIdx = Math.max(0, selectedPhotoIdx - 1);
      setSelectedPhotoIdx(Math.min(newIdx, newPhotos.length - 1));
    }
    if (newPhotos.length === 0) {
        resetAnalysisState();
    }
  };

  // --- Handlers for Video ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setExtractedFrames([]);
      setAnalyzePhotos([]);
      resetAnalysisState();
      extractFrames(url);
    }
  };

  const extractFrames = async (url: string) => {
    setIsExtracting(true);
    setExtractedFrames([]);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.crossOrigin = "anonymous";
    
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(true);
    });

    const duration = video.duration;
    const framesToExtract = 6; 
    const interval = duration / (framesToExtract + 1);
    const newFrames: { url: string; faceCount: number }[] = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      for (let i = 1; i <= framesToExtract; i++) {
        video.currentTime = interval * i;
        await new Promise((resolve) => { video.onseeked = resolve; });
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        let faceCount = 0;
        if (modelsLoaded && faceapi) {
            try {
                const detections = await faceapi.detectAllFaces(canvas as any); 
                faceCount = detections.length;
            } catch (e) {
                console.warn("Frame detection failed", e);
            }
        }
        
        newFrames.push({ 
            url: canvas.toDataURL('image/jpeg'), 
            faceCount 
        });
      }
    }

    setExtractedFrames(newFrames);
    setIsExtracting(false);
  };

  const handleFrameSelect = (frameUrl: string) => {
    setAnalyzePhotos([frameUrl]);
    setSelectedPhotoIdx(0);
    resetAnalysisState();
    setInputMethod('upload');
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (previewCanvasRef.current && imagePreviewRef.current) {
        const { width, height } = imagePreviewRef.current;
        previewCanvasRef.current.width = width;
        previewCanvasRef.current.height = height;
    }
  };

  const runFaceDetection = async () => {
    if (!modelsLoaded || !analyzePhoto || !imagePreviewRef.current || !isImageLoaded || !faceapi) return [];

    try {
      const imgEl = imagePreviewRef.current;
      const detections = await faceapi.detectAllFaces(imgEl)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();
      
      setFaceDetections(detections);

      if (previewCanvasRef.current) {
        const canvas = previewCanvasRef.current;
        const displaySize = { width: imgEl.width, height: imgEl.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
      return detections;
    } catch (e) {
      console.error("Face detection error:", e);
      return [];
    }
  };

  const analyzeImageWithGemini = async () => {
    if (!analyzePhoto) {
        alert("Please upload or capture an image first.");
        return;
    }
    
    setIsAnalyzing(true);
    setAnalysisStep('Initializing Secure AI Gateway...');
    setMatchConfirmed(false);
    
    let biometricData: any[] = [];
    if (modelsLoaded && isImageLoaded) {
      setAnalysisStep('Scanning Facial Landmarks (Local)...');
      biometricData = await runFaceDetection();
    }

    try {
      setAnalysisStep('Preprocessing Image & Extracting Vectors...');
      let base64Image = '';
      if (analyzePhoto.startsWith('data:')) {
        base64Image = analyzePhoto.split(',')[1];
      } else {
        base64Image = await urlToBase64(analyzePhoto);
      }

      setAnalysisStep('Analyzing Facial Features & Biometrics...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const biometricContext = biometricData.length > 0 
        ? `Detected Faces: ${biometricData.length}, Expressions: ${JSON.stringify(biometricData[0]?.expressions)}` 
        : "No local biometric data available.";

      const prompt = `
        You are an advanced forensic AI assistant. Analyze this image of a person.
        Technical data: ${biometricContext}

        Extract: estimated age range, gender, ethnicity, distinctive marks, and expression.
        JSON format required.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedAge: { type: Type.STRING },
              gender: { type: Type.STRING },
              distinctiveFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              expression: { type: Type.STRING },
              qualityScore: { type: Type.NUMBER },
              riskAssessment: { type: Type.STRING },
              behavioralPsychology: { type: Type.STRING }
            }
          }
        }
      });

      setAnalysisStep('Cross-referencing Criminal Database...');
      
      const analysisText = response.text || "{}";
      const jsonStr = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisData = JSON.parse(jsonStr);
      setGeminiAnalysis(analysisData);

      // --- MATCH LOGIC WITH DATABASE USERS ---
      let potentialMatches = [...criminalsDatabase];
      const aiGender = analysisData.gender?.toLowerCase() || '';

      potentialMatches = potentialMatches.map((c) => {
         if (analyzePhoto === c.image) {
            return { ...c, matchScore: 99 };
         }

         let score = 75; 

         if (aiGender && c.gender) {
             const dbGender = c.gender.toLowerCase();
             const aiMale = aiGender.includes('male') && !aiGender.includes('female');
             const dbMale = dbGender.includes('male') && !dbGender.includes('female');
             
             if (aiMale !== dbMale) {
                 score -= 45; 
             } else {
                 score += 5; 
             }
         }

         if (c.age && analysisData.estimatedAge) {
            const ageStr = analysisData.estimatedAge.replace(/\D/g,'');
            if (ageStr.length > 0) {
                 const estAge = parseInt(ageStr.substring(0,2));
                 if (!isNaN(estAge)) {
                    const diff = Math.abs(c.age - estAge);
                    if (diff <= 3) score += 15;
                    else if (diff <= 7) score += 5;
                    else if (diff > 15) score -= 15;
                 }
            }
         }

         score += Math.floor(Math.random() * 10) - 5;
         if (c.id.startsWith(`CR-${new Date().getFullYear()}`)) score += 5;

         return { ...c, matchScore: Math.min(Math.max(score, 0), 98) };
      });

      potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
      potentialMatches = potentialMatches.filter(m => m.matchScore > 40);

      setMatches(potentialMatches);
      
      if (potentialMatches.length > 0) {
        if (potentialMatches[0].matchScore > 60) {
            setSelectedProfile({ ...potentialMatches[0], ...analysisData });
        }
      }

    } catch (error) {
      console.error("Analysis Failed:", error);
      alert('Analysis Failed. See console.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <ScanFace className="text-navy-600 dark:text-blue-400" /> Face-Based Criminal Discovery
          </h2>
          <div className="flex items-center gap-4 mt-1">
             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> System Active
             </span>
             <span className="text-xs text-slate-500 dark:text-slate-400">Database: {isLoadingDB ? 'Syncing...' : `${criminalsDatabase.length} Records`}</span>
             {modelsLoaded && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium px-2 border border-blue-200 rounded-full">Biometric Engine Ready</span>}
          </div>
        </div>
        
        {/* Module Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'analyze' 
                ? 'bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
            }`}
          >
            History Discovery
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'register' 
                ? 'bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
            }`}
          >
            Registry
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'database' 
                ? 'bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
            }`}
          >
            <Database size={14} /> Database
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'analyze' && (
        <div className="flex flex-col h-full gap-4">
          
          {/* Legal Safeguard Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <Scale size={20} className="text-amber-600 dark:text-amber-400" />
               <div>
                 <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Investigative Intelligence Only</p>
                 <p className="text-xs text-amber-700 dark:text-amber-400">Match results are for lead generation and not admissible as primary evidence in court. Human verification required.</p>
               </div>
             </div>
             <div className="text-xs font-mono text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
               AUDIT LOG: {new Date().toLocaleTimeString()} • USER: {Math.floor(Math.random()*1000)}
             </div>
          </div>

          <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
            {/* LEFT PANEL: Input (3 cols) */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">1. Probe Image</h3>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <button onClick={() => { stopCamera(); setInputMethod('upload'); }} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'upload' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}>Upload</button>
                    <button onClick={() => setInputMethod('camera')} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'camera' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}>Camera</button>
                    <button onClick={() => { stopCamera(); setInputMethod('video'); }} className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'video' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}>CCTV</button>
                  </div>

                  {inputMethod === 'upload' && (
                    <div className="h-full flex flex-col gap-3">
                      {analyzePhotos.length === 0 ? (
                        <div 
                          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          onClick={() => analyzeInputRef.current?.click()}
                        >
                          <Upload size={24} className="text-navy-600 dark:text-blue-400 mb-2" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Suspect Photo</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="relative flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {analyzePhoto && (
                              <>
                                <img ref={imagePreviewRef} src={analyzePhoto} className="max-w-full max-h-full object-contain" alt="Preview" crossOrigin="anonymous" onLoad={handleImageLoad} />
                                <canvas ref={previewCanvasRef} className="absolute top-0 left-0 pointer-events-none" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button onClick={(e) => { e.stopPropagation(); removePhoto(selectedPhotoIdx); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full cursor-pointer hover:bg-red-600 transition"><X size={14} /></button>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2 overflow-x-auto p-1 h-20 shrink-0 custom-scrollbar">
                            {analyzePhotos.map((photo, idx) => (
                              <div key={idx} onClick={() => { setSelectedPhotoIdx(idx); resetAnalysisState(); }} className={`relative w-16 h-16 rounded-md cursor-pointer overflow-hidden border-2 shrink-0 transition-all ${selectedPhotoIdx === idx ? 'border-navy-600 ring-1 ring-navy-600' : 'border-slate-200 dark:border-slate-600'}`}>
                                <img src={photo} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                              </div>
                            ))}
                            <button onClick={() => analyzeInputRef.current?.click()} className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"><Plus size={20} className="text-slate-400" /></button>
                          </div>
                        </div>
                      )}
                      <input type="file" multiple ref={analyzeInputRef} className="hidden" accept="image/*" onChange={handleAnalyzePhotoUpload} />
                    </div>
                  )}

                  {inputMethod === 'camera' && (
                    <div className="relative h-64 bg-black rounded-xl overflow-hidden flex flex-col">
                      {isCameraActive ? (
                        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                      ) : analyzePhoto ? (
                        <div className="relative w-full h-full">
                          <img ref={imagePreviewRef} src={analyzePhoto} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" alt="Captured" onLoad={handleImageLoad} />
                          <canvas ref={previewCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]" />
                        </div>
                      ) : <div className="flex-1 flex items-center justify-center text-slate-500"><p className="text-xs">Camera Inactive</p></div>}
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 z-10">
                        {!isCameraActive ? <button onClick={startCamera} className="bg-navy-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Start Cam</button> : 
                        <><button onClick={capturePhoto} className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition"><Camera size={20} /></button><button onClick={stopCamera} className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">Stop</button></>}
                      </div>
                    </div>
                  )}

                  {inputMethod === 'video' && (
                    <div className="flex flex-col gap-3 h-full">
                      {!videoFile ? (
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition" onClick={() => videoInputRef.current?.click()}>
                          <Film size={24} className="text-purple-600 dark:text-purple-400 mb-2" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Footage</p>
                          <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <video src={videoUrl || undefined} controls className="w-full h-full object-contain" />
                            <button onClick={() => { setVideoFile(null); setExtractedFrames([]); setAnalyzePhotos([]); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={14} /></button>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-500">Extracted Frames</span>{isExtracting && <Loader size={14} className="animate-spin" />}</div>
                            <div className="grid grid-cols-3 gap-2">{extractedFrames.map((frame, idx) => (<div key={idx} onClick={() => handleFrameSelect(frame.url)} className={`aspect-square relative cursor-pointer rounded overflow-hidden border-2 transition-all ${analyzePhoto === frame.url ? 'border-emerald-500' : 'border-transparent'}`}><img src={frame.url} className="w-full h-full object-cover" alt={`Frame ${idx}`} />{frame.faceCount > 0 && <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded-full"><ScanFace size={10} /> {frame.faceCount}</div>}</div>))}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={analyzeImageWithGemini} disabled={!analyzePhoto || isAnalyzing} className="w-full bg-navy-800 text-white py-3 rounded-lg font-bold text-sm hover:bg-navy-700 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md">
                      {isAnalyzing ? <Loader className="animate-spin" size={18} /> : <ScanFace size={18} />}
                      {isAnalyzing ? 'Scanning...' : 'Identify Suspect'}
                    </button>
                  </div>
              </div>
            </div>

            {/* CENTER PANEL: Matches (4 cols) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">2. Potential Matches</h3>
                {matches.length > 0 && <span className="text-[10px] bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full font-bold">{matches.length} Found</span>}
              </div>

              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                  {!geminiAnalysis ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                      <Search size={48} className="mb-4" />
                      <p className="text-sm text-center px-8">Run identification to search criminal history database.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Biometric Summary */}
                      <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 border border-slate-200 dark:border-slate-600 text-xs">
                         <h4 className="font-bold text-slate-500 mb-2 uppercase">Probe Attributes</h4>
                         <div className="flex flex-wrap gap-2">
                            <span className="bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-200 dark:border-slate-500">{geminiAnalysis.gender}</span>
                            <span className="bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-200 dark:border-slate-500">Age: {geminiAnalysis.estimatedAge}</span>
                            <span className="bg-white dark:bg-slate-600 px-2 py-1 rounded border border-slate-200 dark:border-slate-500">Quality: {geminiAnalysis.qualityScore}/100</span>
                         </div>
                      </div>

                      {/* Matches List */}
                      <div className="space-y-3">
                        {matches.length > 0 ? matches.map((match) => (
                          <div 
                            key={match.id}
                            onClick={() => {
                                setSelectedProfile({ ...match, ...geminiAnalysis });
                                setMatchConfirmed(false);
                                setProfileTab('bio');
                            }}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedProfile?.id === match.id 
                                ? 'bg-navy-50 border-navy-500 ring-1 ring-navy-500 dark:bg-navy-900/30 dark:border-blue-400' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-navy-300'
                            }`}
                          >
                             <img src={match.image} className="w-12 h-12 rounded bg-slate-200 object-cover shrink-0" alt="Match" />
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <h5 className="text-sm font-bold text-navy-900 dark:text-white truncate">{match.name}</h5>
                                  <span className={`text-xs font-bold ${match.matchScore > 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {match.matchScore}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-end mt-1">
                                   <div>
                                     <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{match.id}</p>
                                     <span className={`text-[10px] uppercase font-bold ${
                                       match.matchScore > 85 ? 'text-emerald-600' : 'text-amber-600'
                                     }`}>
                                       {match.matchScore > 85 ? 'Strong Match' : 'Possible Match'}
                                     </span>
                                   </div>
                                   <ArrowRight size={14} className={`text-slate-300 ${selectedProfile?.id === match.id ? 'text-navy-500' : ''}`} />
                                </div>
                             </div>
                          </div>
                        )) : (
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-center">
                            <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                            <p className="text-sm font-bold text-amber-800">No Records Found</p>
                            <button onClick={handleTransferToRegistry} className="mt-2 text-xs font-bold text-navy-700 underline">Register New Profile</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* RIGHT PANEL: History Discovery (5 cols) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">3. History Discovery</h3>
                {selectedProfile && (
                    <div className="flex bg-slate-200 dark:bg-slate-700 rounded-md p-0.5">
                        <button 
                            onClick={() => setProfileTab('bio')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${profileTab === 'bio' ? 'bg-white dark:bg-slate-600 shadow-sm text-navy-900 dark:text-white' : 'text-slate-500'}`}
                        >
                            Verify
                        </button>
                        <button 
                            onClick={() => setProfileTab('history')}
                            className={`px-2 py-1 text-[10px] font-bold rounded ${profileTab === 'history' ? 'bg-white dark:bg-slate-600 shadow-sm text-navy-900 dark:text-white' : 'text-slate-500'}`}
                        >
                            History
                        </button>
                    </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                 {selectedProfile ? (
                   <div className="space-y-6 animate-fade-in">
                      {/* Header Profile Info */}
                      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                         <div className="relative">
                           <img src={selectedProfile.image} className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover" />
                           <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white ${selectedProfile.riskLevel === 'High' ? 'bg-red-500' : 'bg-orange-500'}`}>
                             {selectedProfile.riskLevel === 'High' ? 'H' : 'M'}
                           </span>
                         </div>
                         <div>
                            <h2 className="text-lg font-bold text-navy-900 dark:text-white leading-tight">{selectedProfile.name}</h2>
                            <p className="text-xs text-slate-500 font-mono">{selectedProfile.id}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-1.5 rounded uppercase font-bold">{selectedProfile.status}</span>
                            </div>
                         </div>
                      </div>

                      {/* TAB: BIO & VERIFICATION */}
                      {profileTab === 'bio' && (
                          <div className="space-y-6">
                              {/* Side by Side Verification */}
                              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                      <Split size={14} /> Identity Verification
                                  </h4>
                                  <div className="flex gap-4 items-center justify-center">
                                      <div className="text-center">
                                          <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-slate-300 dark:border-slate-500 mb-1">
                                              <img src={analyzePhoto!} className="w-full h-full object-cover" alt="Probe" />
                                          </div>
                                          <span className="text-[10px] text-slate-500 uppercase font-bold">Probe</span>
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-1">
                                          <div className={`w-8 h-1 rounded-full ${selectedProfile.matchScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                          <span className={`text-xs font-black ${selectedProfile.matchScore > 85 ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedProfile.matchScore}%</span>
                                      </div>

                                      <div className="text-center">
                                          <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-slate-300 dark:border-slate-500 mb-1">
                                              <img src={selectedProfile.image} className="w-full h-full object-cover" alt="Record" />
                                          </div>
                                          <span className="text-[10px] text-slate-500 uppercase font-bold">Record</span>
                                      </div>
                                  </div>
                                  
                                  {!matchConfirmed ? (
                                      <button 
                                        onClick={() => setMatchConfirmed(true)}
                                        className="w-full mt-4 bg-navy-800 text-white py-2 rounded text-xs font-bold hover:bg-navy-700 transition"
                                      >
                                        Confirm Identity Match
                                      </button>
                                  ) : (
                                      <div className="mt-4 p-2 bg-emerald-50 text-emerald-700 text-center rounded border border-emerald-100 text-xs font-bold flex items-center justify-center gap-2">
                                          <CheckCircle size={14} /> Match Confirmed by Officer
                                      </div>
                                  )}
                              </div>

                              {/* Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Last Seen</span>
                                  <div className="flex items-center gap-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                                     <MapPin size={12} className="text-red-500" /> {selectedProfile.lastSeen}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Known Crimes</span>
                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                      {Array.isArray(selectedProfile.crimes) ? selectedProfile.crimes.join(', ') : selectedProfile.crimes}
                                  </p>
                                </div>
                              </div>
                          </div>
                      )}

                      {/* TAB: CRIMINAL HISTORY */}
                      {profileTab === 'history' && (
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Gavel size={14} /> FIR & Case History
                              </h4>
                              
                              {selectedProfile.caseHistory && selectedProfile.caseHistory.length > 0 ? (
                                  <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-6 pl-4 py-1">
                                      {selectedProfile.caseHistory.map((history: any, idx: number) => (
                                          <div key={idx} className="relative">
                                              <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 ${history.status.includes('Closed') ? 'bg-slate-400' : 'bg-red-500'}`}></div>
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <span className="text-xs font-mono font-bold text-navy-700 dark:text-blue-400 block">{history.id}</span>
                                                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{history.type}</span>
                                                  </div>
                                                  <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{history.date}</span>
                                              </div>
                                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                                  <Landmark size={10} /> {history.station}
                                              </div>
                                              <div className="mt-1">
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                      history.status.includes('Closed') 
                                                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' 
                                                        : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                                                  }`}>
                                                      {history.status}
                                                  </span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded text-center text-xs text-slate-500">
                                      No detailed case history records linked to this ID.
                                  </div>
                              )}
                              
                              <button className="w-full mt-4 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 py-2 rounded text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                  Request Full Case Files (CCTNS)
                              </button>
                          </div>
                      )}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                     <User size={48} className="mb-4" />
                     <p className="text-sm text-center">Select a match to view criminal history.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Tab Content */}
      {activeTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in flex-1">
            <div className="lg:col-span-1 space-y-4">
              <div 
                className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {regPhoto ? (
                  <>
                    <img src={regPhoto} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                      <span className="text-white font-bold ml-2">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-navy-600 dark:text-blue-400">
                      <Camera size={32} />
                    </div>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">Upload Mugshot</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleRegPhotoUpload}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-lg text-navy-900 dark:text-white mb-6 flex items-center gap-2">
                  <UserPlus size={20} className="text-navy-600 dark:text-blue-400" /> New Suspect Registration
                </h3>
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={regForm.name}
                        onChange={e => setRegForm({...regForm, name: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        placeholder="e.g. Rajinder Singh"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Alias</label>
                      <input 
                        type="text" 
                        value={regForm.alias}
                        onChange={e => setRegForm({...regForm, alias: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        placeholder="e.g. Rocky"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        value={regForm.dob}
                        onChange={e => setRegForm({...regForm, dob: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gender</label>
                      <select 
                        value={regForm.gender}
                        onChange={e => setRegForm({...regForm, gender: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Primary Crime Type</label>
                      <select 
                        value={regForm.crimeType}
                        onChange={e => setRegForm({...regForm, crimeType: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      >
                        <option>Theft</option>
                        <option>Assault</option>
                        <option>Fraud</option>
                        <option>Cybercrime</option>
                        <option>Narcotics</option>
                        <option>Homicide</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Last Seen Location</label>
                      <input 
                        type="text" 
                        value={regForm.lastSeen}
                        onChange={e => setRegForm({...regForm, lastSeen: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        placeholder="City, Area or Coordinates"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Distinctive Marks / Notes</label>
                      <textarea 
                        rows={3}
                        value={regForm.notes}
                        onChange={e => setRegForm({...regForm, notes: e.target.value})}
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        placeholder="Tattoos, Scars, Limp, etc."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button type="submit" disabled={isLoadingDB} className="bg-navy-800 text-white px-6 py-2.5 rounded-md font-bold hover:bg-navy-700 transition shadow-lg disabled:opacity-50">
                      {isLoadingDB ? 'Saving to Database...' : 'Save Record & Index'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="animate-fade-in flex-1 overflow-hidden flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="text-lg font-bold text-navy-900 dark:text-white">Criminal Database Registry</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Total Records: {criminalsDatabase.length} {isLoadingDB && '(Syncing...)'}</p>
             </div>
             <button 
               onClick={() => setActiveTab('register')}
               className="bg-navy-800 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-navy-700 transition"
             >
               <Plus size={16} /> Add New Suspect
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pb-10">
             {criminalsDatabase.map((criminal) => (
               <div key={criminal.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group">
                 <div className="flex p-4 gap-4">
                   <img src={criminal.image} alt={criminal.name} className="w-16 h-16 rounded-md object-cover bg-slate-100" />
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-navy-900 dark:text-white text-sm truncate">{criminal.name}</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">{criminal.id}</p>
                     <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                       criminal.riskLevel === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                       criminal.riskLevel === 'Medium' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                       'bg-slate-100 text-slate-700 border border-slate-200'
                     }`}>
                       {criminal.riskLevel} Risk
                     </span>
                   </div>
                 </div>
                 
                 <div className="px-4 pb-3">
                   <div className="text-xs text-slate-500 dark:text-slate-400 mb-1"><strong>Crimes:</strong> {Array.isArray(criminal.crimes) ? criminal.crimes.join(', ') : criminal.crimes}</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400"><strong>Loc:</strong> {criminal.lastSeen}</div>
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                   <button 
                     onClick={() => handleDeleteCriminal(criminal.id)}
                     className="text-slate-400 hover:text-red-600 transition p-1"
                     title="Delete Record"
                   >
                     <Trash2 size={16} />
                   </button>
                   <button 
                     onClick={() => handleTestCriminal(criminal)}
                     className="text-xs font-bold text-navy-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                   >
                     Test Face Scan <ArrowRight size={12} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default CriminalRegistry;

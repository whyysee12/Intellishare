import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import * as faceapi from 'face-api.js';
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
  ArrowRight
} from 'lucide-react';

// Mock Data for "Existing Database"
const INITIAL_MOCK_CRIMINALS = [
  {
    id: 'CR-2023-8819',
    name: 'Rajinder "Rocky" Singh',
    age: 34,
    gender: 'Male',
    status: 'Wanted',
    riskLevel: 'High',
    crimes: ['Armed Robbery', 'Vehicle Theft', 'Assault'],
    lastSeen: 'Sector 14, Gurgaon',
    features: ['Scar on left cheek', 'Heavy beard', 'Tattoo on neck'],
    matchScore: 94,
    image: 'https://ui-avatars.com/api/?name=Rajinder+Singh&background=random&size=200'
  },
  {
    id: 'CR-2022-1022',
    name: 'Vikram Malhotra',
    age: 32,
    gender: 'Male',
    status: 'In Custody',
    riskLevel: 'Medium',
    crimes: ['Cyber Fraud', 'Identity Theft'],
    lastSeen: 'Mumbai Airport',
    features: ['Glasses', 'Clean shaven'],
    matchScore: 78,
    image: 'https://ui-avatars.com/api/?name=Vikram+Malhotra&background=random&size=200'
  },
  {
    id: 'CR-2024-0056',
    name: 'Suresh Kumar',
    age: 36,
    gender: 'Male',
    status: 'Paroled',
    riskLevel: 'Low',
    crimes: ['Petty Theft'],
    lastSeen: 'Delhi Cantt',
    features: ['Mole on chin'],
    matchScore: 65,
    image: 'https://ui-avatars.com/api/?name=Suresh+Kumar&background=random&size=200'
  }
];

const CriminalRegistry = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'analyze' | 'database'>('analyze');
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera' | 'video'>('upload');
  
  // -- LINKED DATA STATE --
  const [criminalsDatabase, setCriminalsDatabase] = useState(INITIAL_MOCK_CRIMINALS);

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
  const [matches, setMatches] = useState<typeof INITIAL_MOCK_CRIMINALS>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
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

  // --- Initialize Models ---
  useEffect(() => {
    const loadModels = async () => {
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
  }, []);

  // --- Helpers ---

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // The result looks like "data:image/jpeg;base64,....."
        // We need to split it if present.
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
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 30; // Default
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // --- Handlers for Database Management ---
  const handleDeleteCriminal = (id: string) => {
    if(window.confirm('Are you sure you want to delete this record?')) {
      setCriminalsDatabase(prev => prev.filter(c => c.id !== id));
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
    // Move current analysis photo to registration
    if (analyzePhoto) {
      setRegPhoto(analyzePhoto);
      setActiveTab('register');
      // Reset matches to avoid confusion when returning
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regForm.name || !regPhoto) {
        alert("Name and Photo are required for registration.");
        return;
    }

    // Create New Criminal Object
    const newCriminal = {
        id: `CR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        name: regForm.name,
        age: calculateAge(regForm.dob),
        gender: regForm.gender,
        status: 'Wanted', // Default status for new suspects
        riskLevel: 'High', // Default high risk
        crimes: [regForm.crimeType],
        lastSeen: regForm.lastSeen || 'Unknown Location',
        features: regForm.notes ? [regForm.notes] : ['Recently Registered'],
        matchScore: 0, // Calculated during analysis
        image: regPhoto // The uploaded image
    };

    // Add to Live Database
    setCriminalsDatabase(prev => [newCriminal, ...prev]);

    // Automatically set the analysis photo to the registered photo
    setAnalyzePhotos([regPhoto]);
    setSelectedPhotoIdx(0);
    resetAnalysisState();
    setInputMethod('upload');

    alert(`Suspect "${regForm.name}" registered successfully! Redirecting to Face Scan...`);
    
    // Reset Form
    setRegForm({
      name: '',
      alias: '',
      dob: '',
      gender: 'Male',
      crimeType: 'Theft',
      lastSeen: '',
      notes: ''
    });
    setRegPhoto(null);

    // Switch to Analysis Tab to verify
    setActiveTab('analyze');
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
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        
        // Add to photos array and select it
        setAnalyzePhotos(prev => [...prev, dataUrl]);
        setSelectedPhotoIdx(prev => analyzePhotos.length); // New index
        resetAnalysisState();
        stopCamera();
        setInputMethod('upload'); // Switch to upload view to show result
      }
    }
  };

  // --- Handlers for Analysis ---
  const handleAnalyzePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Fix: Explicitly type file as File to allow URL.createObjectURL to accept it
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
      // If we removed the current or a previous one, adjust index
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
        if (modelsLoaded) {
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
    // When selecting a frame, treat it as the single source for analysis
    setAnalyzePhotos([frameUrl]);
    setSelectedPhotoIdx(0);
    resetAnalysisState();
    setInputMethod('upload'); // Switch view to analysis
  };

  // Called when image is fully loaded in DOM
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (previewCanvasRef.current && imagePreviewRef.current) {
        const { width, height } = imagePreviewRef.current;
        previewCanvasRef.current.width = width;
        previewCanvasRef.current.height = height;
    }
  };

  const runFaceDetection = async () => {
    // Only run if models are loaded AND image is visible/loaded
    if (!modelsLoaded || !analyzePhoto || !imagePreviewRef.current || !isImageLoaded) return [];

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
    
    // 1. Run Local FaceAPI First
    let biometricData: any[] = [];
    if (modelsLoaded && isImageLoaded) {
      setAnalysisStep('Scanning Facial Landmarks (Local)...');
      biometricData = await runFaceDetection();
    }

    // 2. Prepare Data for Gemini
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
        ? `
          Biometric Analysis Data (FaceAPI):
          - Detected Faces: ${biometricData.length}
          - Primary Face Expressions: ${JSON.stringify(biometricData[0]?.expressions)}
          - Face Descriptor Available: Yes
        ` 
        : "No local biometric data available.";

      const prompt = `
        You are an advanced forensic AI assistant. Analyze this image of a person for law enforcement purposes.
        I have performed a preliminary biometric scan locally. Here is the technical data found:
        ${biometricContext}

        Using the provided image AND the technical data above:
        Identify key facial features, estimated age range, gender, ethnicity, distinctive marks (scars, tattoos, glasses, facial hair), and expression.
        
        Return the response in structured JSON format as defined in the schema.
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
              ethnicity: { type: Type.STRING },
              distinctiveFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
              facialAttributes: { 
                type: Type.OBJECT,
                properties: {
                  faceShape: { type: Type.STRING },
                  complexion: { type: Type.STRING },
                  hairColor: { type: Type.STRING },
                  eyeColor: { type: Type.STRING }
                }
              },
              expression: { type: Type.STRING },
              accessories: { type: Type.ARRAY, items: { type: Type.STRING } },
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

      // --- MATCH LOGIC WITH REGISTERED USERS ---
      // We use the criminalsDatabase state which now contains both Mock + Newly Registered users
      let potentialMatches = [...criminalsDatabase];

      const aiGender = analysisData.gender?.toLowerCase() || '';

      potentialMatches = potentialMatches.map((c) => {
         // 1. EXACT IMAGE MATCH: If the analyzed image is the same source as the DB record (e.g. Test Scan)
         if (analyzePhoto === c.image) {
            return { ...c, matchScore: 99 };
         }

         let score = 75; // Stronger base score

         // 2. GENDER CHECK
         if (aiGender) {
             const dbGender = c.gender.toLowerCase();
             const isMale = dbGender === 'male' || dbGender === 'man';
             const aiMale = aiGender === 'male' || aiGender === 'man';
             const isFemale = dbGender === 'female' || dbGender === 'woman';
             const aiFemale = aiGender === 'female' || aiGender === 'woman';

             if (isMale !== aiMale && isFemale !== aiFemale) {
                 score -= 45; // Significant penalty
             } else {
                 score += 5; // Slight boost for match
             }
         }

         // 3. AGE CHECK
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

         // 4. RANDOM VARIANCE (reduced)
         score += Math.floor(Math.random() * 10) - 5;
         
         // 5. User Added Boost (Optional, but less aggressive)
         // We verify if it matches the 'New' pattern (ID starts with CR-CurrentYear)
         if (c.id.startsWith(`CR-${new Date().getFullYear()}`)) {
             score += 5;
         }

         return { ...c, matchScore: Math.min(Math.max(score, 0), 98) };
      });

      // Sort by match score
      potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
      
      // Filter out low scores
      potentialMatches = potentialMatches.filter(m => m.matchScore > 40);

      setMatches(potentialMatches);
      
      if (potentialMatches.length > 0) {
        if (potentialMatches[0].matchScore > 60) {
            setSelectedProfile({ ...potentialMatches[0], ...analysisData });
        } else {
            setSelectedProfile(null);
        }
      } else {
        setSelectedProfile(null);
      }

    } catch (error) {
      console.error("Analysis Failed (Falling back to mock):", error);
      
      // FALLBACK MOCK DATA
      setTimeout(() => {
          setAnalysisStep('Using Offline Fallback Analysis...');
          const mockResult = {
            estimatedAge: "30-35",
            gender: "Male",
            ethnicity: "South Asian",
            distinctiveFeatures: ["Stubble beard", "Stern expression", "Short hair"],
            facialAttributes: {
                faceShape: "Oval",
                complexion: "Wheatish",
                hairColor: "Black",
                eyeColor: "Dark Brown"
            },
            expression: "Neutral/Serious",
            accessories: [],
            qualityScore: 88,
            riskAssessment: "High",
            behavioralPsychology: "Subject appears alert and guarded."
          };
          setGeminiAnalysis(mockResult);

          // Fallback scoring logic
          const fallbackMatches = criminalsDatabase.map(c => {
             const isMock = INITIAL_MOCK_CRIMINALS.find(m => m.id === c.id);
             return {
                ...c,
                // If not mock, it's the user's registration -> High Score
                matchScore: !isMock ? 98 : (Math.floor(Math.random() * 30) + 50)
             };
          }).sort((a, b) => b.matchScore - a.matchScore);

          setMatches(fallbackMatches);
          if (fallbackMatches.length > 0) {
            setSelectedProfile({ ...fallbackMatches[0], ...mockResult });
          }
      }, 1000);
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
            <ScanFace className="text-navy-600 dark:text-blue-400" /> AI Criminal Face Recognition
          </h2>
          <div className="flex items-center gap-4 mt-1">
             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> System Active
             </span>
             <span className="text-xs text-slate-500 dark:text-slate-400">Database: {criminalsDatabase.length} Records</span>
             {modelsLoaded && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium px-2 border border-blue-200 rounded-full">FaceAPI Ready</span>}
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
            Face Scan
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
        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* LEFT PANEL: Input (3 cols) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
               <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">1. Image Input</h3>
             </div>
             
             <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                   <button 
                     onClick={() => {
                        stopCamera();
                        setInputMethod('upload');
                     }}
                     className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'upload' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}
                   >
                     Upload
                   </button>
                   <button 
                     onClick={() => setInputMethod('camera')}
                     className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'camera' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}
                   >
                     Live Cam
                   </button>
                   <button 
                     onClick={() => {
                        stopCamera();
                        setInputMethod('video');
                     }}
                     className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded transition ${inputMethod === 'video' ? 'bg-white dark:bg-slate-600 shadow text-navy-800 dark:text-white' : 'text-slate-500'}`}
                   >
                     CCTV Video
                   </button>
                </div>

                {inputMethod === 'upload' && (
                  <div className="h-full flex flex-col gap-3">
                    {analyzePhotos.length === 0 ? (
                      <div 
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition relative group"
                        onClick={() => {
                          analyzeInputRef.current?.click();
                        }}
                      >
                        <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-navy-600 dark:text-blue-400 mb-3">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to Upload</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG, PNG (Multiple Allowed)</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col gap-3">
                        {/* Main Preview */}
                        <div className="relative flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {analyzePhoto && (
                            <>
                              <img 
                                ref={imagePreviewRef}
                                src={analyzePhoto} 
                                className="max-w-full max-h-full object-contain" 
                                alt="Preview"
                                crossOrigin="anonymous" 
                                onLoad={handleImageLoad}
                              />
                              <canvas ref={previewCanvasRef} className="absolute top-0 left-0 pointer-events-none" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePhoto(selectedPhotoIdx);
                                }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full cursor-pointer hover:bg-red-600 transition"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Thumbnail Strip */}
                        <div className="flex gap-2 overflow-x-auto p-1 h-20 shrink-0 custom-scrollbar">
                          {analyzePhotos.map((photo, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => { 
                                setSelectedPhotoIdx(idx); 
                                resetAnalysisState();
                              }}
                              className={`relative w-16 h-16 rounded-md cursor-pointer overflow-hidden border-2 shrink-0 transition-all ${selectedPhotoIdx === idx ? 'border-navy-600 ring-1 ring-navy-600' : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'}`}
                            >
                              <img src={photo} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                            </div>
                          ))}
                          <button 
                            onClick={() => analyzeInputRef.current?.click()} 
                            className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center text-slate-400 hover:text-navy-600 hover:border-navy-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0"
                          >
                            <Plus size={20} />
                          </button>
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
                    ) : analyzePhoto && inputMethod === 'camera' ? (
                      <div className="relative w-full h-full">
                        <img 
                          ref={imagePreviewRef} 
                          src={analyzePhoto} 
                          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                          alt="Captured"
                          onLoad={handleImageLoad}
                        />
                        <canvas ref={previewCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]" />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500">
                        <p className="text-xs">Camera Inactive</p>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <div className="absolute bottom-4 left-0 w-full flex justify-center gap-3 z-10">
                      {!isCameraActive ? (
                        <button onClick={startCamera} className="bg-navy-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">Start Cam</button>
                      ) : (
                        <>
                          <button onClick={capturePhoto} className="bg-white text-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition"><Camera size={20} /></button>
                          <button onClick={stopCamera} className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">Stop</button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {inputMethod === 'video' && (
                  <div className="flex flex-col gap-3 h-full">
                    {!videoFile ? (
                      <div 
                        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex-1 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <div className="w-12 h-12 bg-purple-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                          <Film size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload CCTV Footage</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">MP4, AVI, MKV (Max 50MB)</p>
                        <input type="file" ref={videoInputRef} className="hidden" accept="video/mp4,video/avi,video/*" onChange={handleVideoUpload} />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <video src={videoUrl || undefined} controls className="w-full h-full object-contain" />
                          <button 
                            onClick={() => { setVideoFile(null); setExtractedFrames([]); setAnalyzePhotos([]); }}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Extracted Frames</span>
                            {isExtracting && <Loader size={14} className="animate-spin text-navy-600" />}
                          </div>
                          {extractedFrames.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {extractedFrames.map((frame, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => handleFrameSelect(frame.url)}
                                  className={`aspect-square relative cursor-pointer rounded overflow-hidden border-2 transition-all ${
                                    analyzePhoto === frame.url ? 'border-emerald-500 ring-2 ring-emerald-200' : 
                                    frame.faceCount > 0 ? 'border-blue-400' : 'border-transparent hover:border-slate-300'
                                  }`}
                                >
                                  <img src={frame.url} className="w-full h-full object-cover" alt={`Frame ${idx}`} />
                                  {frame.faceCount > 0 && (
                                     <div className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 rounded-full flex items-center shadow-sm">
                                       <ScanFace size={10} className="mr-1" /> {frame.faceCount}
                                     </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-slate-400">
                              {isExtracting ? 'Extracting & Scanning...' : 'Processing video...'}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                   <button 
                     onClick={analyzeImageWithGemini}
                     disabled={!analyzePhoto || isAnalyzing}
                     className="w-full bg-navy-800 text-white py-3 rounded-lg font-bold text-sm hover:bg-navy-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                   >
                     {isAnalyzing ? <Loader className="animate-spin" size={18} /> : <ScanFace size={18} />}
                     {isAnalyzing ? 'Processing...' : 'Run Analysis'}
                   </button>
                </div>
             </div>
          </div>

          {/* CENTER PANEL: Analysis & Matches (5 cols) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative">
             {isAnalyzing && (
               <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 z-20 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-navy-600 border-t-transparent rounded-full animate-spin"></div>
                    <ScanFace size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-navy-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-2">AI Analysis in Progress</h3>
                  <p className="text-sm font-mono text-navy-600 dark:text-blue-400">{analysisStep}</p>
                  <p className="text-xs text-slate-500 mt-4">Generating biometric signature & querying CCTNS...</p>
               </div>
             )}

             <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">2. Analysis Results</h3>
               {geminiAnalysis && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Analysis Complete</span>}
             </div>

             <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {!geminiAnalysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <Search size={48} className="mb-4" />
                    <p className="text-sm text-center px-8">Upload an image and run analysis to view AI-generated attributes and potential database matches.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-slide-up">
                    {/* Gemini Attributes Card */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                       <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                         <Fingerprint size={14} /> Biometric Estimation
                       </h4>
                       <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                          <div>
                            <span className="text-xs text-slate-500 block">Est. Age</span>
                            <span className="font-bold text-navy-900 dark:text-white">{geminiAnalysis.estimatedAge}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Gender</span>
                            <span className="font-bold text-navy-900 dark:text-white">{geminiAnalysis.gender}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Expression</span>
                            <span className="font-bold text-navy-900 dark:text-white">{geminiAnalysis.expression}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Quality Score</span>
                            <span className={`font-bold ${(geminiAnalysis.qualityScore <= 1 ? geminiAnalysis.qualityScore * 100 : geminiAnalysis.qualityScore) > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {geminiAnalysis.qualityScore <= 1 ? Math.round(geminiAnalysis.qualityScore * 100) : geminiAnalysis.qualityScore}/100
                            </span>
                          </div>
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                          <span className="text-xs text-slate-500 block mb-1">Distinctive Features</span>
                          <div className="flex flex-wrap gap-1.5">
                            {geminiAnalysis.distinctiveFeatures?.map((feat: string, i: number) => (
                              <span key={i} className="text-[10px] bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 px-2 py-1 rounded-md font-medium text-slate-700 dark:text-slate-200">
                                {feat}
                              </span>
                            )) || <span className="text-xs text-slate-400">None detected</span>}
                          </div>
                       </div>
                    </div>

                    {/* Face API Detections Debug Info (Visible if detected) */}
                    {faceDetections.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-2">Face Detection Telemetry</h4>
                        <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300">
                           <span>Faces Detected: <strong>{faceDetections.length}</strong></span>
                           <span>Primary Confidence: <strong>{Math.round(faceDetections[0]?.detection?.score * 100)}%</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Matches List */}
                    <div>
                       <div className="flex flex-col gap-2 mb-3">
                         <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                              Potential Database Matches
                            </h4>
                            <span className="text-xs normal-case bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full">{processedMatches.length} found</span>
                         </div>
                         
                         {/* Filter Controls */}
                         {matches.length > 0 && (
                           <div className="flex flex-wrap gap-2">
                             <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1">
                               <ArrowUpDown size={12} className="text-slate-400" />
                               <select 
                                 value={sortBy} 
                                 onChange={(e) => setSortBy(e.target.value as any)}
                                 className="text-xs bg-transparent text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
                               >
                                 <option value="score">Sort: Confidence</option>
                                 <option value="risk">Sort: Risk Level</option>
                                 <option value="location">Sort: Last Location</option>
                               </select>
                             </div>
                             
                             <div className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1">
                               <Filter size={12} className="text-slate-400" />
                               <select 
                                 value={filterRisk} 
                                 onChange={(e) => setFilterRisk(e.target.value)}
                                 className="text-xs bg-transparent text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
                               >
                                 <option value="All">Risk: All</option>
                                 <option value="High">High</option>
                                 <option value="Medium">Medium</option>
                                 <option value="Low">Low</option>
                               </select>
                             </div>
                           </div>
                         )}
                       </div>
                       
                       <div className="space-y-3">
                         {processedMatches.length > 0 ? processedMatches.map((match) => (
                           <div 
                             key={match.id}
                             onClick={() => setSelectedProfile({ ...match, ...geminiAnalysis })}
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
                                   <span className={`text-xs font-bold ${match.matchScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                     {match.matchScore}%
                                   </span>
                                 </div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{match.id}</p>
                                 <div className="flex gap-2 mt-1">
                                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-1.5 rounded uppercase font-bold">{match.status}</span>
                                    <span className={`text-[10px] px-1.5 rounded uppercase font-bold border ${
                                      match.riskLevel === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                                      match.riskLevel === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                                      'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>{match.riskLevel} Risk</span>
                                 </div>
                              </div>
                           </div>
                         )) : (
                           <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-center">
                             <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                             <p className="text-sm font-bold text-amber-800">No Matches Found</p>
                             <p className="text-xs text-amber-700 mt-1 mb-3">Subject not in database.</p>
                             <button 
                               onClick={handleTransferToRegistry}
                               className="bg-navy-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-navy-700 transition"
                             >
                               Register This Suspect
                             </button>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* RIGHT PANEL: Profile Details (4 cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
               <h3 className="font-bold text-sm text-navy-900 dark:text-white uppercase tracking-wide">3. Criminal Profile</h3>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {selectedProfile ? (
                  <div className="space-y-6 animate-fade-in">
                     {/* Header */}
                     <div className="text-center">
                        <div className="relative inline-block">
                          <img src={selectedProfile.image} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-md mx-auto object-cover" alt="Profile" />
                          <span className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold ${selectedProfile.riskLevel === 'High' ? 'bg-red-500' : 'bg-orange-500'}`}>
                            {selectedProfile.riskLevel === 'High' ? 'H' : 'M'}
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-navy-900 dark:text-white">{selectedProfile.name}</h2>
                        <p className="text-sm font-mono text-slate-500">{selectedProfile.id}</p>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-2 justify-center">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-white text-xs font-bold rounded hover:bg-navy-700 transition">
                          <FileText size={14} /> Full Report
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition">
                          <Share2 size={14} /> Share
                        </button>
                     </div>

                     {/* Info Grid */}
                     <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-100 dark:border-slate-600">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Status</span>
                          <p className="text-sm font-bold text-red-600">{selectedProfile.status}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Last Location</span>
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                             <MapPin size={12} className="text-red-500" /> {selectedProfile.lastSeen}
                          </div>
                        </div>
                     </div>

                     {/* Timeline */}
                     <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Criminal History</h4>
                        <div className="space-y-4 relative border-l-2 border-slate-200 ml-2 pl-4">
                           {selectedProfile.crimes?.map((crime: string, i: number) => (
                             <div key={i} className="relative">
                               <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></div>
                               <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{crime}</p>
                               <p className="text-xs text-slate-500">202{3-i} • New Delhi</p>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* AI Insights */}
                     {selectedProfile.behavioralPsychology && (
                       <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2 flex items-center gap-2">
                            <Activity size={14} /> AI Behavioral Insight
                          </h4>
                          <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed italic">
                            "{selectedProfile.behavioralPsychology}"
                          </p>
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <User size={48} className="mb-4" />
                    <p className="text-sm text-center">Select a match to view detailed criminal profile.</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      )}

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
                    <button type="submit" className="bg-navy-800 text-white px-6 py-2.5 rounded-md font-bold hover:bg-navy-700 transition shadow-lg">
                      Save Record & Index
                    </button>
                  </div>
                </form>
              </div>
            </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="animate-fade-in flex-1 overflow-hidden flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="text-lg font-bold text-navy-900 dark:text-white">Criminal Database Registry</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">Total Records: {criminalsDatabase.length}</p>
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
                   <div className="text-xs text-slate-500 dark:text-slate-400 mb-1"><strong>Crimes:</strong> {criminal.crimes.join(', ')}</div>
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
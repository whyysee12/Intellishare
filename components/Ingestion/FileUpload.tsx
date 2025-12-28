import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Image, Film, Music, CheckCircle, AlertCircle, Loader, Tag, File } from 'lucide-react';

const FileUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Metadata state
  const [caseId, setCaseId] = useState('');
  const [category, setCategory] = useState('General');
  const [classification, setClassification] = useState('Unclassified');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image size={20} className="text-purple-500" />;
    if (type.includes('video')) return <Film size={20} className="text-red-500" />;
    if (type.includes('audio')) return <Music size={20} className="text-amber-500" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    return <File size={20} className="text-blue-500" />;
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setCompleted(true);
          return 100;
        }
        return prev + 5; // Simulate speed
      });
    }, 200);
  };

  const resetUpload = () => {
    setFiles([]);
    setCompleted(false);
    setProgress(0);
    setCaseId('');
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-navy-900 mb-2">Ingestion Successful</h3>
        <p className="text-slate-500 max-w-md mb-8">
          {files.length} files have been securely uploaded, scanned for malware, and indexed. 
          Entity extraction is currently processing in the background.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={resetUpload}
            className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Upload More
          </button>
          <button className="px-6 py-2 bg-navy-800 text-white rounded-md font-medium hover:bg-navy-700 transition">
            View Case Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Dropzone */}
      <div className="lg:col-span-2 space-y-6">
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
            dragActive 
              ? 'border-navy-500 bg-navy-50' 
              : 'border-slate-300 hover:border-navy-400 hover:bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleChange} 
          />
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-navy-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">Drag & Drop Evidence Files</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Support for FIR (PDF), CCTV Footage (MP4), Call Recordings (WAV/MP3), and Crime Scene Photos (JPG/PNG).
          </p>
          <button className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-50 transition font-medium text-sm shadow-sm pointer-events-none">
            Browse Computer
          </button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Queue ({files.length})</span>
              <button onClick={() => setFiles([])} className="text-xs text-red-600 hover:underline">Clear All</button>
            </div>
            <div className="divide-y divide-slate-200 max-h-60 overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded border border-slate-200 shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {uploading ? (
                     <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-4">
                       <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(5, progress - (i * 10))}%` }}></div>
                     </div>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-slate-400 hover:text-red-500 p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Metadata */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
          <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Tag size={18} /> Ingestion Metadata
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Associate Case ID (Optional)</label>
              <input 
                type="text" 
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="e.g. FIR-2024-001"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Evidence Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900"
              >
                <option>General Investigation</option>
                <option>Forensic Report</option>
                <option>Surveillance Footage</option>
                <option>Witness Statement</option>
                <option>Financial Record</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Classification</label>
              <select 
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900"
              >
                <option>Unclassified</option>
                <option>Restricted</option>
                <option>Confidential</option>
                <option>Secret</option>
                <option>Top Secret</option>
              </select>
            </div>

            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-xs text-blue-800">
               <div className="flex gap-2 items-start">
                 <AlertCircle size={14} className="mt-0.5 shrink-0" />
                 <p>Auto-OCR and Face Recognition will be applied to all image/PDF uploads based on agency policy.</p>
               </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="w-full bg-navy-800 text-white py-3 rounded-md font-bold hover:bg-navy-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin" size={18} /> Processing... {progress}%
                </>
              ) : (
                <>Start Secure Ingestion</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  MessageSquare, 
  Send, 
  User, 
  Lock, 
  MoreVertical,
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Key, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  AlertOctagon,
  Loader,
  Camera,
  Scan,
  Unlock,
  KeyRound
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import * as CryptoUtils from '../../utils/encryption';

interface EncryptedMessage {
  id: number;
  sender: string;
  agency: string;
  time: string;
  text: string; // The decrypted text for display (simulating local cache)
  encryptedData?: { iv: number[], data: number[], toString: () => string }; // The actual network payload
  isMe: boolean;
}

interface Contact {
  id: string;
  name: string;
  agency: string;
  initials: string;
  colorClass: string; // Tailwind color class for avatar bg
  lastTime: string;
  lastPreview: string;
}

const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Delhi Police Cyber Cell', agency: 'Delhi Police', initials: 'DP', colorClass: 'bg-navy-100 text-navy-700', lastTime: '10:35 AM', lastPreview: 'Ballistics report match found.' },
  { id: 'c2', name: 'CBI Anti-Corruption', agency: 'CBI', initials: 'CB', colorClass: 'bg-red-100 text-red-700', lastTime: 'Yesterday', lastPreview: 'Requesting file access...' },
  { id: 'c3', name: 'NIA Task Force', agency: 'NIA', initials: 'NI', colorClass: 'bg-orange-100 text-orange-700', lastTime: '2 days ago', lastPreview: 'Surveillance logs updated.' },
  { id: 'c4', name: 'Mumbai Crime Branch', agency: 'Mumbai Police', initials: 'MC', colorClass: 'bg-blue-100 text-blue-700', lastTime: 'Last week', lastPreview: 'Suspect spotted in Bandra.' }
];

const MOCK_CHATS: Record<string, any[]> = {
  'c1': [
    { id: 1, sender: 'ACP R. Singh', agency: 'Delhi Police', time: '10:30 AM', text: 'Has the forensic report for Case #1044 been uploaded yet?', isMe: false },
    { id: 2, sender: 'You', agency: 'Me', time: '10:32 AM', text: 'Yes, uploading it now securely. You should see it in the Shared Repository tab shortly.', isMe: true },
    { id: 3, sender: 'ACP R. Singh', agency: 'Delhi Police', time: '10:35 AM', text: 'Received. The ballistics match our suspect. Good work.', isMe: false },
  ],
  'c2': [
    { id: 1, sender: 'Director K. Menon', agency: 'CBI', time: 'Yesterday', text: 'We need immediate access to the financial logs of the suspect in FIR-2024-992.', isMe: false },
    { id: 2, sender: 'You', agency: 'Me', time: 'Yesterday', text: 'Sending the encrypted zip file now. Password will be sent via secondary channel.', isMe: true },
  ],
  'c3': [
    { id: 1, sender: 'Agent Vinod', agency: 'NIA', time: '2 days ago', text: 'Drone surveillance feeds are live for Sector 4.', isMe: false },
    { id: 2, sender: 'You', agency: 'Me', time: '2 days ago', text: 'Copy that. Monitoring the feed.', isMe: true },
  ],
  'c4': [
    { id: 1, sender: 'Insp. Deshmukh', agency: 'Mumbai Police', time: 'Last week', text: 'Any updates on the interstate transfer?', isMe: false },
    { id: 2, sender: 'You', agency: 'Me', time: 'Last week', text: 'Paperwork is still pending approval.', isMe: true },
  ]
};

const InterAgencyShare = () => {
  const { preferences } = useTheme();
  const [activeTab, setActiveTab] = useState('requests');
  const [showRequestModal, setShowRequestModal] = useState(false);

  // E2EE State
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'generating' | 'active' | 'error'>('generating');
  const [keyFingerprint, setKeyFingerprint] = useState('');

  // Authentication & Navigation State
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [authMode, setAuthMode] = useState<'face' | 'password' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  // Chat Selection State
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock Data
  const [incomingRequests, setIncomingRequests] = useState([
    { id: 'REQ-2024-001', agency: 'CBI (Central)', requestor: 'Inspector V. Sharma', caseId: 'FIR-2024-1044', reason: 'Cross-border narcotics link verification', date: '2024-03-15', status: 'Pending', type: 'Full Access' },
    { id: 'REQ-2024-003', agency: 'Delhi Police (Cyber)', requestor: 'ACP R. Singh', caseId: 'FIR-2024-0992', reason: 'Suspect phone location history match', date: '2024-03-14', status: 'Approved', type: 'Read Only' },
    { id: 'REQ-2024-005', agency: 'NIA', requestor: 'Analyst K. Iyer', caseId: 'FIR-2024-1102', reason: 'Terror financing pattern check', date: '2024-03-12', status: 'Rejected', type: 'Evidence Only' },
  ]);

  const [outgoingRequests, setOutgoingRequests] = useState([
    { id: 'REQ-OUT-882', targetAgency: 'Mumbai Police', caseId: 'MUM-CR-22', reason: 'Suspect movement tracking', date: '2024-03-16', status: 'Pending' },
    { id: 'REQ-OUT-881', targetAgency: 'Narcotics Bureau', caseId: 'NCB-DL-44', reason: 'Drug seizure report correlation', date: '2024-03-10', status: 'Approved' },
  ]);

  const [sharedFiles, setSharedFiles] = useState([
    { id: 'DOC-9921', name: 'Forensic_Report_Sector4.pdf', sharedWith: 'CBI', date: '2024-03-14', expires: '2024-04-14', status: 'Active' },
    { id: 'VID-2211', name: 'CCTV_MainSquare_Cam2.mp4', sharedWith: 'Delhi Police', date: '2024-03-12', expires: '2024-03-20', status: 'Active' },
  ]);

  const [chatMessages, setChatMessages] = useState<EncryptedMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle Tab Switch - Lock Secure Comms on entry
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'comms') {
      setIsIdentityVerified(false);
      setSessionKey(null);
      setChatMessages([]);
      setKeyStatus('generating');
    }
  };

  // Initialize Encryption (Only after verification)
  useEffect(() => {
    const initCrypto = async () => {
      setChatMessages([]); // Clear previous messages while loading
      setKeyStatus('generating');
      
      try {
        const key = await CryptoUtils.generateKey();
        setSessionKey(key);
        
        // Export key to get fingerprint (simulation)
        const exported = await window.crypto.subtle.exportKey("jwk", key);
        setKeyFingerprint(exported.k ? exported.k.substring(0, 8).toUpperCase() : 'UNKNOWN');
        setKeyStatus('active');

        // Load mock messages for selected contact
        const rawMessages = MOCK_CHATS[selectedContact.id] || [];

        const encryptedInitial = await Promise.all(rawMessages.map(async (msg) => {
          const enc = await CryptoUtils.encrypt(msg.text, key);
          return { ...msg, encryptedData: enc };
        }));

        setChatMessages(encryptedInitial);

      } catch (e) {
        console.error("Crypto Error", e);
        setKeyStatus('error');
      }
    };

    if (activeTab === 'comms' && isIdentityVerified) {
      initCrypto();
    }
  }, [activeTab, isIdentityVerified, selectedContact]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab, showEncrypted]);

  // Camera Logic for Face Verification
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsScanning(true);
      
      // Simulate verification process
      setTimeout(() => {
        handleVerificationSuccess();
      }, 3500);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Unable to access camera. Please use Password verification.");
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
    if (authMode === 'face') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [authMode]);

  const handleVerificationSuccess = () => {
    stopCamera();
    setAuthMode(null);
    setIsIdentityVerified(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.length > 0) {
      // Mock password check
      setIsIdentityVerified(true);
      setAuthMode(null);
      setPasswordInput('');
    }
  };

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setIncomingRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action } : req
    ));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionKey) return;
    
    // Encrypt Message
    const encryptedData = await CryptoUtils.encrypt(chatInput, sessionKey);

    const newMessage: EncryptedMessage = {
      id: chatMessages.length + 1,
      sender: 'You',
      agency: 'Me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: chatInput,
      encryptedData: encryptedData,
      isMe: true
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield size={24} className="text-navy-600 dark:text-blue-400" /> Inter-Agency Collaboration
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Secure data exchange and communication gateway.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-navy-800 text-white px-4 py-2 rounded-md hover:bg-navy-700 transition shadow-sm font-bold text-sm flex items-center gap-2"
        >
          <Plus size={16} /> New Data Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
        <button
          onClick={() => handleTabChange('requests')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'requests' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
          }`}
        >
          Access Control
        </button>
        <button
          onClick={() => handleTabChange('repository')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'repository' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
          }`}
        >
          Shared Repository
        </button>
        <button
          onClick={() => handleTabChange('comms')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'comms' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
          }`}
        >
          Secure Comms
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* Incoming */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-500" /> Incoming Requests (Requires Action)
              </h3>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Requesting Agency</th>
                      <th className="px-4 py-3">Case Context</th>
                      <th className="px-4 py-3">Justification</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {incomingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{req.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-navy-900 dark:text-white">{req.agency}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{req.requestor}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{req.caseId}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            req.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {req.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleAction(req.id, 'Approved')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition" title="Approve">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleAction(req.id, 'Rejected')} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outgoing */}
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                <Send size={20} className="text-navy-500" /> Outgoing Requests (My Status)
              </h3>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Target Agency</th>
                      <th className="px-4 py-3">Requested Data</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {outgoingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{req.id}</td>
                        <td className="px-4 py-3 font-bold text-navy-900 dark:text-white">{req.targetAgency}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{req.caseId}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500 dark:text-slate-400">{req.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* REPOSITORY TAB */}
        {activeTab === 'repository' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
             <div className="flex justify-between items-center mb-6">
               <div className="relative max-w-md w-full">
                 <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
                 <input type="text" placeholder="Search shared files..." className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm outline-none focus:ring-2 focus:ring-navy-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
               </div>
               <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300">
                   <Filter size={16} /> Filter
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {sharedFiles.map(file => (
                 <div key={file.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center">
                         <FileText size={20} />
                       </div>
                       <div>
                         <h4 className="font-bold text-navy-900 dark:text-white text-sm">{file.name}</h4>
                         <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                           <span className="flex items-center gap-1"><Shield size={10} /> Shared with: {file.sharedWith}</span>
                           <span className="flex items-center gap-1"><Clock size={10} /> Expires: {file.expires}</span>
                         </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">{file.status}</span>
                       <button className="p-2 text-slate-400 hover:text-navy-700 dark:hover:text-blue-400 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                         <Eye size={18} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-navy-700 dark:hover:text-blue-400 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                         <Download size={18} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* SECURE COMMS TAB */}
        {activeTab === 'comms' && (
          <div className="flex h-full relative">
             {/* Security Lock Screen Overlay */}
             {!isIdentityVerified && (
               <div className="absolute inset-0 z-40 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-6">
                    <Lock size={40} className="text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Secure Channel Locked</h3>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mb-8">
                    This communication channel is end-to-end encrypted. To access the raw decrypted data, you must verify your identity.
                  </p>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setAuthMode('face')}
                      className="flex items-center gap-2 bg-navy-800 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-navy-700 transition hover:scale-105"
                    >
                      <Camera size={20} /> Verify with Face ID
                    </button>
                    <button 
                      onClick={() => setAuthMode('password')}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      <KeyRound size={20} /> Use Password
                    </button>
                  </div>
               </div>
             )}

             {/* Sidebar List */}
             <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
               <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <input type="text" placeholder="Search contacts..." className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-navy-500" />
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                 {CONTACTS.map((contact) => (
                   <div 
                     key={contact.id} 
                     onClick={() => setSelectedContact(contact)}
                     className={`p-4 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors ${selectedContact.id === contact.id ? 'bg-white dark:bg-slate-800 border-l-4 border-navy-600' : 'border-l-4 border-transparent'}`}
                   >
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm text-navy-900 dark:text-white truncate pr-2">{contact.name}</span>
                        <span className="text-[10px] text-slate-400">{contact.lastTime}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.lastPreview}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* Chat Window */}
             <div className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 ${!isIdentityVerified ? 'filter blur-sm pointer-events-none' : ''}`}>
                {/* Chat Header */}
                <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedContact.colorClass} dark:bg-opacity-20`}>
                        {selectedContact.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy-900 dark:text-white">{selectedContact.name}</h4>
                          {keyStatus === 'active' && (
                            <span className="flex items-center gap-1 text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                              <Lock size={8} /> AES-256-GCM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {keyStatus === 'generating' ? (
                            <span className="flex items-center gap-1 text-amber-500"><RefreshCw size={10} className="animate-spin" /> Handshaking...</span>
                          ) : keyStatus === 'error' ? (
                            <span className="flex items-center gap-1 text-red-500"><AlertOctagon size={10} /> Encryption Failed</span>
                          ) : (
                            <span className="font-mono text-[9px] opacity-70">FP: {keyFingerprint}</span>
                          )}
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full px-1 p-0.5 border border-slate-200 dark:border-slate-600">
                         <span className="text-[10px] font-bold text-slate-500 px-2 uppercase">Raw Data</span>
                         <button 
                           onClick={() => setShowEncrypted(!showEncrypted)}
                           className={`p-1 rounded-full transition-colors ${showEncrypted ? 'text-navy-600 bg-white shadow' : 'text-slate-400'}`}
                         >
                           {showEncrypted ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                         </button>
                      </div>
                      <button className="text-slate-400 hover:text-navy-700 dark:hover:text-blue-400"><MoreVertical size={20} /></button>
                   </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                   {chatMessages.length === 0 && keyStatus === 'active' && (
                     <div className="text-center py-10 text-slate-400 text-sm">No messages yet. Start a secure conversation.</div>
                   )}
                   {chatMessages.map(msg => (
                     <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                          msg.isMe 
                            ? 'bg-navy-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}>
                           <div className="flex justify-between items-end gap-4 mb-1">
                             <span className={`text-[10px] font-bold ${msg.isMe ? 'text-navy-100' : 'text-navy-700 dark:text-blue-400'}`}>{msg.sender}</span>
                             <span className={`text-[10px] ${msg.isMe ? 'text-navy-200' : 'text-slate-400'}`}>{msg.time}</span>
                           </div>
                           
                           {/* Message Content with Decryption Logic */}
                           <div className="text-sm leading-relaxed break-words font-sans">
                             {showEncrypted && msg.encryptedData ? (
                               <div className="font-mono text-[10px] opacity-80 bg-black/20 p-2 rounded break-all">
                                 {msg.encryptedData.toString()}
                               </div>
                             ) : (
                               msg.text
                             )}
                           </div>
                           
                           {msg.encryptedData && !showEncrypted && (
                             <div className={`flex justify-end mt-1`}>
                               <Lock size={8} className={`opacity-50 ${msg.isMe ? 'text-navy-200' : 'text-slate-400'}`} />
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                   <button type="button" className="p-2 text-slate-400 hover:text-navy-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full">
                     <FileText size={20} />
                   </button>
                   <div className="flex-1 relative">
                     <input 
                       type="text" 
                       value={chatInput}
                       onChange={(e) => setChatInput(e.target.value)}
                       placeholder={keyStatus === 'active' ? `Message ${selectedContact.agency}...` : "Initializing secure channel..."}
                       disabled={keyStatus !== 'active'}
                       className="w-full border border-slate-300 dark:border-slate-600 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-navy-500 bg-white dark:bg-slate-700 dark:text-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                     />
                     <div className="absolute right-3 top-2.5">
                       {keyStatus === 'active' ? <Lock size={14} className="text-emerald-500" /> : <Loader size={14} className="animate-spin text-slate-400" />}
                     </div>
                   </div>
                   <button 
                     type="submit" 
                     disabled={keyStatus !== 'active' || !chatInput.trim()}
                     className="p-2 bg-navy-800 text-white rounded-full hover:bg-navy-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send size={18} />
                   </button>
                </form>
             </div>
          </div>
        )}

      </div>

      {/* Verification Modal */}
      {authMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden relative">
              <button 
                onClick={() => { setAuthMode(null); stopCamera(); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1 bg-black/20 rounded-full"
              >
                <XCircle size={20} />
              </button>

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
                      
                      {/* Scanning Animation */}
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                           <div className="w-48 h-48 border-2 border-emerald-500/50 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-scan"></div>
                              <div className="absolute bottom-2 left-0 w-full text-center">
                                <span className="bg-black/60 text-emerald-400 text-[10px] px-2 py-1 rounded font-mono">ANALYZING BIOMETRICS</span>
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                   <div className="p-4 bg-slate-900 text-white text-center">
                      <h3 className="font-bold text-lg mb-1">Face Verification</h3>
                      <p className="text-xs text-slate-400">Please look directly at the camera. Identifying officer...</p>
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
                     <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authorized personnel verification required.</p>
                   </div>
                   <form onSubmit={handlePasswordSubmit}>
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

      {/* New Request Modal (Existing) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">New Data Access Request</h3>
              <form className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Target Agency</label>
                   <select className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white">
                     <option>Select Agency...</option>
                     <option>CBI</option>
                     <option>Delhi Police</option>
                     <option>Mumbai Police</option>
                     <option>NIA</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Requested Data / Case ID</label>
                   <input type="text" className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white" placeholder="e.g. FIR-2023-992" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Official Justification</label>
                   <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white" rows={3} placeholder="Explain reason for access..."></textarea>
                 </div>
                 <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-md text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                    <button type="button" onClick={() => { setShowRequestModal(false); alert("Request Sent Successfully"); }} className="flex-1 py-2 bg-navy-800 text-white rounded-md text-sm font-bold hover:bg-navy-700">Send Request</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default InterAgencyShare;
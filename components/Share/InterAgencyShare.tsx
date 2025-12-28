import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const InterAgencyShare = () => {
  const { preferences } = useTheme();
  const [activeTab, setActiveTab] = useState('requests');
  const [showRequestModal, setShowRequestModal] = useState(false);

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

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ACP R. Singh', agency: 'Delhi Police', time: '10:30 AM', text: 'Has the forensic report for Case #1044 been uploaded yet?', isMe: false },
    { id: 2, sender: 'You', agency: 'Me', time: '10:32 AM', text: 'Yes, uploading it now securely. You should see it in the Shared Repository tab shortly.', isMe: true },
    { id: 3, sender: 'ACP R. Singh', agency: 'Delhi Police', time: '10:35 AM', text: 'Received. The ballistics match our suspect. Good work.', isMe: false },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setIncomingRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action } : req
    ));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, {
      id: chatMessages.length + 1,
      sender: 'You',
      agency: 'Me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      text: chatInput,
      isMe: true
    }]);
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
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'requests' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
          }`}
        >
          Access Control
        </button>
        <button
          onClick={() => setActiveTab('repository')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'repository' 
              ? 'border-navy-600 text-navy-900 dark:text-white dark:border-blue-400' 
              : 'border-transparent text-slate-500 hover:text-navy-700 dark:hover:text-slate-300'
          }`}
        >
          Shared Repository
        </button>
        <button
          onClick={() => setActiveTab('comms')}
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
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        
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
          <div className="flex h-full">
             {/* Sidebar List */}
             <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
               <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <input type="text" placeholder="Search contacts..." className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-navy-500" />
               </div>
               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                 {['Delhi Police Cyber Cell', 'CBI Anti-Corruption', 'NIA Task Force', 'Mumbai Crime Branch'].map((contact, i) => (
                   <div key={i} className={`p-4 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors ${i === 0 ? 'bg-white dark:bg-slate-800 border-l-4 border-navy-600' : ''}`}>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold text-sm text-navy-900 dark:text-white truncate pr-2">{contact}</span>
                        <span className="text-[10px] text-slate-400">10:35 AM</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Latest message preview...</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* Chat Window */}
             <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950">
                {/* Chat Header */}
                <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center text-navy-700 dark:text-blue-400 font-bold text-xs">DP</div>
                      <div>
                        <h4 className="font-bold text-sm text-navy-900 dark:text-white">Delhi Police Cyber Cell</h4>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <Lock size={10} /> End-to-End Encrypted
                        </div>
                      </div>
                   </div>
                   <button className="text-slate-400 hover:text-navy-700 dark:hover:text-blue-400"><MoreVertical size={20} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
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
                           <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                   <button type="button" className="p-2 text-slate-400 hover:text-navy-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full">
                     <FileText size={20} />
                   </button>
                   <input 
                     type="text" 
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     placeholder="Type a secure message..." 
                     className="flex-1 border border-slate-300 dark:border-slate-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-navy-500 bg-white dark:bg-slate-700 dark:text-white"
                   />
                   <button type="submit" className="p-2 bg-navy-800 text-white rounded-full hover:bg-navy-700 transition shadow-md">
                     <Send size={18} />
                   </button>
                </form>
             </div>
          </div>
        )}

      </div>

      {/* New Request Modal */}
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
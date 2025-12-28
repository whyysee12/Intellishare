import React, { useState } from 'react';
import { Save, Send, Plus, Trash2, MapPin, Calendar, User, FileText, AlertTriangle } from 'lucide-react';

const ManualEntry = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [suspects, setSuspects] = useState([{ name: '', age: '', details: '' }]);
  
  const addSuspect = () => setSuspects([...suspects, { name: '', age: '', details: '' }]);
  const removeSuspect = (index: number) => setSuspects(suspects.filter((_, i) => i !== index));
  
  // Basic form handlers (simplified for demo)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Case filed successfully! Reference ID: FIR-" + Math.floor(Math.random() * 10000));
  };

  const sections = ['Case Details', 'Incident Info', 'Involved Parties'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8 px-4">
        {sections.map((label, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center z-10">
              <div 
                onClick={() => setActiveSection(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer border-2 ${
                  activeSection === index 
                    ? 'bg-navy-800 text-white border-navy-800' 
                    : activeSection > index 
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-400 border-slate-300'
                }`}
              >
                {activeSection > index ? '✓' : index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${activeSection === index ? 'text-navy-900' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {index < sections.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 mb-6 transition-colors ${activeSection > index ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8">
          
          {/* Section 1: Case Details */}
          {activeSection === 0 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText size={20} className="text-navy-600" /> Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">FIR / Case Number <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. 2024/02/1044" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Crime Category <span className="text-red-500">*</span></label>
                  <select className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900">
                    <option>Select Category...</option>
                    <option>Theft / Burglary</option>
                    <option>Cybercrime</option>
                    <option>Assault</option>
                    <option>Fraud</option>
                    <option>Narcotics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Priority Level</label>
                  <select className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900">
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Investigating Officer</label>
                  <input type="text" defaultValue="Officer Rajesh Kumar" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Incident Info */}
          {activeSection === 1 && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MapPin size={20} className="text-navy-600" /> Incident Location & Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Date of Incident</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-2.5 text-slate-400" />
                      <input type="date" className="w-full border border-slate-300 rounded-md pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Time (Approx)</label>
                    <input type="time" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Location / Address</label>
                    <input type="text" placeholder="House No, Street, Landmark, City" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none mb-2 bg-white text-slate-900" />
                    <div className="h-40 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                      <MapPin size={20} className="mr-2" /> Map Selection Widget Placeholder
                    </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-1">Incident Description</label>
                     <textarea rows={5} className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy-500 outline-none bg-white text-slate-900" placeholder="Detailed account of the incident..."></textarea>
                  </div>
                </div>
             </div>
          )}

          {/* Section 3: Involved Parties */}
          {activeSection === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={20} className="text-navy-600" /> Suspects & Witnesses
              </h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Identified Suspects</label>
                {suspects.map((suspect, index) => (
                  <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                      <input type="text" placeholder="Name / Alias" className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-navy-500 outline-none" />
                      <input type="text" placeholder="Age / Appearance" className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-navy-500 outline-none" />
                      <input type="text" placeholder="Contact / Address" className="border border-slate-300 rounded px-3 py-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-navy-500 outline-none" />
                    </div>
                    {suspects.length > 1 && (
                      <button type="button" onClick={() => removeSuspect(index)} className="text-slate-400 hover:text-red-500 pt-2">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSuspect} className="text-sm font-bold text-navy-700 flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Add Another Suspect
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Victim Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5" />
                  <div>
                    <p className="font-bold">Privacy Protected</p>
                    <p>Victim details are encrypted by default and only visible to authorized case officers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center">
          <div>
            {activeSection > 0 && (
              <button 
                type="button" 
                onClick={() => setActiveSection(prev => prev - 1)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-navy-800 transition"
              >
                Previous Step
              </button>
            )}
          </div>
          <div className="flex gap-3">
             <button type="button" className="px-5 py-2 border border-slate-300 bg-white text-slate-700 rounded-md font-medium hover:bg-slate-50 transition flex items-center gap-2">
               <Save size={18} /> Save Draft
             </button>
             {activeSection < sections.length - 1 ? (
               <button 
                 type="button" 
                 onClick={() => setActiveSection(prev => prev + 1)}
                 className="px-6 py-2 bg-navy-800 text-white rounded-md font-bold hover:bg-navy-700 transition shadow-sm"
               >
                 Next Step
               </button>
             ) : (
                <button 
                 type="submit" 
                 className="px-6 py-2 bg-emerald-600 text-white rounded-md font-bold hover:bg-emerald-500 transition shadow-sm flex items-center gap-2"
               >
                 <Send size={18} /> Submit FIR
               </button>
             )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManualEntry;
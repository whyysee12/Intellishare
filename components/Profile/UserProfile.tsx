import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  User, 
  Shield, 
  Settings, 
  Activity, 
  Camera, 
  Save, 
  Smartphone, 
  Globe, 
  Monitor, 
  LogOut,
  Key,
  Clock,
  MapPin,
  Search
} from 'lucide-react';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { preferences, updatePreference } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'activity'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Mock form state (pre-filled with user data or placeholders)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    designation: 'Senior Investigating Officer',
    department: 'Cyber Crime Division',
    location: 'Headquarters, New Delhi'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully.');
    }, 1000);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-[3px] ${
        activeTab === id
          ? 'bg-navy-50 border-navy-800 text-navy-900 shadow-sm dark:bg-navy-900 dark:border-blue-400 dark:text-blue-100'
          : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-navy-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={18} className={activeTab === id ? 'text-navy-700 dark:text-blue-400' : 'text-slate-400'} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">User Profile & Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account credentials and system preferences.</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
          ID: {user?.badgeNumber}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
            <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="relative group cursor-pointer">
                <img 
                  src={user?.avatar || "https://picsum.photos/100/100"} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md object-cover"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <h3 className="mt-4 font-bold text-navy-900 dark:text-white text-lg">{user?.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.role}</p>
              <div className="mt-2 text-xs font-medium px-2 py-1 bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-blue-200 rounded-full border border-navy-200 dark:border-navy-700">
                {user?.agency}
              </div>
            </div>
            <nav className="py-2">
              <TabButton id="profile" label="Profile Information" icon={User} />
              <TabButton id="security" label="Security & Login" icon={Shield} />
              <TabButton id="preferences" label="System Preferences" icon={Settings} />
              <TabButton id="activity" label="My Activity Log" icon={Activity} />
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium hover:text-red-700 w-full px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-h-[600px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white border-l-4 border-navy-600 pl-3">Personal Information</h3>
                  <span className="text-xs text-slate-400">* Required fields for official records</span>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        disabled
                        className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md px-4 py-2 text-sm cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Contact IT admin to change email</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Badge Number</label>
                      <input 
                        type="text" 
                        value={user?.badgeNumber} 
                        disabled 
                        className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md px-4 py-2 text-sm font-mono cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Designation / Rank</label>
                      <input 
                        type="text" 
                        value={formData.designation}
                        onChange={e => setFormData({...formData, designation: e.target.value})}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <input 
                        type="text" 
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Posted Location</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 focus:outline-none dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-navy-800 text-white px-6 py-2 rounded-md hover:bg-navy-700 transition shadow-sm font-medium text-sm flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save size={16} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white border-l-4 border-navy-600 pl-3">Security Settings</h3>
                </div>

                <div className="space-y-8 max-w-3xl">
                  {/* Password Change */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                      <Key size={18} className="text-navy-600 dark:text-blue-400" /> Change Password
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Current Password</label>
                        <input type="password" className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm dark:bg-slate-800 dark:text-white" placeholder="••••••••" />
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">New Password</label>
                          <input type="password" className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm dark:bg-slate-800 dark:text-white" placeholder="••••••••" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Confirm Password</label>
                          <input type="password" className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm dark:bg-slate-800 dark:text-white" placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                       <button className="text-sm font-bold text-navy-700 dark:text-blue-400 hover:text-navy-900 underline">Update Password</button>
                    </div>
                  </div>

                  {/* 2FA */}
                  <div className="flex items-start justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <div className="flex gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full h-fit">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure your account with OTP verification via mobile.</p>
                        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Enabled (Last verified: Today)
                        </div>
                      </div>
                    </div>
                    <button className="border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Configure</button>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white mb-4">Active Sessions</h4>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="px-4 py-3">Device</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Last Active</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                          <tr>
                            <td className="px-4 py-3 flex items-center gap-2 dark:text-slate-300">
                              <Monitor size={16} className="text-slate-400" />
                              <span className="font-medium">Windows PC (Chrome)</span>
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-1.5 rounded border border-emerald-200 dark:border-emerald-800">Current</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">New Delhi, IN</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Active Now</td>
                            <td className="px-4 py-3 text-right"></td>
                          </tr>
                          <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                            <td className="px-4 py-3 flex items-center gap-2 dark:text-slate-300">
                              <Smartphone size={16} className="text-slate-400" />
                              <span className="font-medium">iPhone 13 (Safari)</span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Mumbai, IN</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">2 days ago</td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-red-600 dark:text-red-400 text-xs font-bold hover:underline">Revoke</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white border-l-4 border-navy-600 pl-3">System Preferences</h3>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Interface Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div 
                        onClick={() => updatePreference('theme', 'light')}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${preferences.theme === 'light' ? 'border-navy-600 bg-slate-50 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        <div className="h-20 bg-white border border-slate-200 rounded mb-2 shadow-sm"></div>
                        <div className="text-center font-bold text-navy-900 dark:text-white text-sm">Light (Gov Standard)</div>
                      </div>
                      <div 
                        onClick={() => updatePreference('theme', 'dark')}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${preferences.theme === 'dark' ? 'border-navy-600 bg-slate-50 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        <div className="h-20 bg-navy-900 rounded mb-2 shadow-sm"></div>
                        <div className="text-center font-bold text-slate-600 dark:text-slate-300 text-sm">Dark Mode</div>
                      </div>
                      <div 
                        onClick={() => updatePreference('theme', 'contrast')}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${preferences.theme === 'contrast' ? 'border-navy-600 bg-slate-50 dark:bg-slate-700' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                      >
                        <div className="h-20 bg-slate-200 rounded mb-2 shadow-sm border border-black"></div>
                        <div className="text-center font-bold text-slate-600 dark:text-slate-300 text-sm">High Contrast</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 dark:border-slate-700 pb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Language & Locale</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">System Language</span>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3 top-2.5 text-slate-400" />
                          <select 
                            value={preferences.language}
                            onChange={(e) => updatePreference('language', e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-600 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 dark:bg-slate-700 dark:text-white"
                          >
                            <option>English (UK)</option>
                            <option>Hindi</option>
                            <option>Marathi</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Date Format</span>
                         <select 
                           value={preferences.dateFormat}
                           onChange={(e) => updatePreference('dateFormat', e.target.value)}
                           className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-navy-600 dark:bg-slate-700 dark:text-white"
                         >
                            <option>DD/MM/YYYY (Indian Standard)</option>
                            <option>MM/DD/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                      </div>
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Dashboard Customization</label>
                     <div className="space-y-2">
                       <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                         <input 
                           type="checkbox" 
                           checked={preferences.showQuickStats} 
                           onChange={(e) => updatePreference('showQuickStats', e.target.checked)}
                           className="rounded text-navy-600 focus:ring-navy-600" 
                         />
                         Show Quick Stats Widget
                       </label>
                       <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                         <input 
                           type="checkbox" 
                           checked={preferences.realTimeMap} 
                           onChange={(e) => updatePreference('realTimeMap', e.target.checked)}
                           className="rounded text-navy-600 focus:ring-navy-600" 
                         />
                         Enable Real-time Map Updates
                       </label>
                       <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                         <input 
                           type="checkbox" 
                           checked={preferences.compactTables} 
                           onChange={(e) => updatePreference('compactTables', e.target.checked)}
                           className="rounded text-navy-600 focus:ring-navy-600" 
                         />
                         Compact View for Tables
                       </label>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="p-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white border-l-4 border-navy-600 pl-3">Recent Activity History</h3>
                  <button className="text-xs text-navy-600 dark:text-blue-400 hover:underline font-bold">Export Log</button>
                </div>

                <div className="space-y-6">
                  {/* Recent Searches */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Recent Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {['DL-3C-S-2211', 'Case #4991', 'Suspect: Raj Malhotra', 'Sector 44 Theft'].map((term, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                          <Search size={12} /> {term}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Timeline */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Action Log</h4>
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6 pl-6 py-2">
                      {[
                        { action: 'Updated profile information', time: 'Just now', type: 'system' },
                        { action: 'Viewed Case #FIR-2024-1044', time: '2 hours ago', type: 'view' },
                        { action: 'Exported Monthly Crime Report', time: 'Yesterday, 10:00 AM', type: 'export' },
                        { action: 'Login from new device (IP: 192.168.1.1)', time: 'Yesterday, 09:15 AM', type: 'security' },
                        { action: 'Shared evidence with NIA Analyst', time: '2 days ago', type: 'share' },
                      ].map((log, i) => (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${
                            log.type === 'security' ? 'bg-red-500' : 
                            log.type === 'export' ? 'bg-emerald-500' : 'bg-navy-500'
                          }`}></div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <Clock size={12} /> {log.time}
                          </div>
                        </div>
                      ))}
                    </div>
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

export default UserProfile;
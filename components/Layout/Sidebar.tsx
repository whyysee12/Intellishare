import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Share2, 
  BarChart3, 
  UploadCloud,
  Settings,
  ShieldAlert,
  Users,
  UserX,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBrandingClick = () => {
    // Log out the user and redirect to login page
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/intelligence', icon: BrainCircuit, label: 'Continuity Hub' }, // Renamed from Intelligence Hub
    { to: '/search', icon: Search, label: 'Search & Context' },
    { to: '/cases', icon: FileText, label: 'Case Management' },
    { to: '/analytics', icon: BarChart3, label: 'Case Analytics' }, // Moved down
    { to: '/criminals', icon: UserX, label: 'Criminal Registry' },
    { to: '/ingest', icon: UploadCloud, label: 'Data Ingestion' },
    { to: '/share', icon: Share2, label: 'Inter-Agency' },
  ];

  if (user?.role === 'Administrator') {
    navItems.push({ to: '/admin', icon: Users, label: 'Admin Panel' });
  }

  return (
    <div className="w-64 bg-navy-900 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto border-r border-navy-800 shadow-xl z-50">
      <div 
        onClick={handleBrandingClick}
        className="p-6 flex items-center gap-3 border-b border-navy-800 bg-navy-900 cursor-pointer hover:bg-navy-800 transition-colors group"
        title="Logout and return to Login"
      >
        <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
           <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-white leading-tight">INTELLISHARE</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest group-hover:text-slate-300">Official Use Only</p>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-3 px-2 text-[10px] uppercase text-slate-400 font-bold tracking-widest">Main Modules</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 border-l-[3px] ${
                  isActive 
                    ? 'bg-navy-800 text-white border-white shadow-md' 
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  <span className="font-medium text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-navy-800 bg-navy-900">
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${isActive ? 'bg-navy-800' : 'hover:bg-navy-800'}`
          }
        >
          <img 
            src={user?.avatar || "https://picsum.photos/100/100"} 
            alt="Profile" 
            className="w-9 h-9 rounded-md border border-navy-600 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role} | {user?.agency}</p>
          </div>
          <Settings size={16} className="text-slate-400 hover:text-white transition-colors" />
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
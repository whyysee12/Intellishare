import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NOTIFICATIONS } from '../../data/mockData';

const Header = () => {
  const { user, logout } = useAuth();
  const { preferences } = useTheme();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    if (preferences.dateFormat.startsWith('DD/MM/YYYY')) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } else if (preferences.dateFormat.startsWith('MM/DD/YYYY')) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm transition-colors duration-200">
      
      {/* Left: Search Bar */}
      <div className="flex items-center flex-1 max-w-xl gap-4">
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md leading-5 bg-slate-50 dark:bg-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-600 focus:ring-1 focus:ring-navy-500 focus:border-navy-500 sm:text-sm transition-colors text-slate-900 dark:text-white"
            placeholder="Global Search (Case ID, Name, Vehicle #)..."
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
             <kbd className="inline-flex items-center border border-slate-200 dark:border-slate-600 rounded px-2 text-xs font-sans font-medium text-slate-400">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-600">
          <Clock size={16} className="text-navy-600 dark:text-blue-400" />
          <span className="font-mono text-sm font-medium">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-xs text-slate-400 border-l border-slate-200 dark:border-slate-500 pl-2">
            {formatDate(time)}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-navy-700 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
            )}
          </button>
          
          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Notifications</h3>
                <span className="text-xs text-navy-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {NOTIFICATIONS.length > 0 ? (
                  NOTIFICATIONS.map(n => (
                    <div key={n.id} className="p-3 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.time} ago</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new notifications</div>
                )}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-xs font-bold text-navy-700 dark:text-blue-400 hover:text-navy-900 dark:hover:text-blue-300">View All Activity</button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-navy-900 dark:text-white leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user?.agency}</p>
          </div>
          <div className="relative group cursor-pointer">
            <img 
              src={user?.avatar || "https://picsum.photos/100/100"} 
              alt="Profile" 
              className="h-9 w-9 rounded-md border border-slate-200 dark:border-slate-600 object-cover"
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-slate-200 dark:border-slate-700 hidden group-hover:block">
               <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 md:hidden">
                 <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{user?.agency}</p>
               </div>
               <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Profile Settings</button>
               <button 
                 onClick={logout}
                 className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
               >
                 <LogOut size={14} /> Sign Out
               </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
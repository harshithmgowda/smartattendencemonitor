
import React from 'react';
import { View, UserRole } from '../types';
import { LayoutDashboard, Camera, UserPlus, Settings, Terminal, Database, UserCircle, LogOut, ScanFace } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, onLogout }) => {
  
  // Define menus based on role
  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'attendance', label: 'Visual Input', icon: <Camera size={20} /> },
    { id: 'register', label: 'Registration', icon: <UserPlus size={20} /> },
    { id: 'database', label: 'Database', icon: <Database size={20} /> },
  ];

  const studentItems = [
    { id: 'student-dashboard', label: 'My Profile', icon: <UserCircle size={20} /> },
    { id: 'attendance', label: 'Scan Attendance', icon: <ScanFace size={20} /> },
  ];

  const navItems = userRole === 'admin' ? adminItems : studentItems;

  return (
    <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0 z-20">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Terminal size={28} className="text-[#E50914]" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              Smart<span className="text-[#E50914]">Attend</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              {userRole === 'admin' ? 'Admin Console' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id as View)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${
              currentView === item.id
                ? 'text-white bg-[#E50914]/10 border border-[#E50914]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
            }`}
          >
            {/* Active Indicator Bar */}
            {currentView === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E50914] shadow-[0_0_10px_#E50914]"></div>
            )}
            
            <span className={`transition-colors duration-300 ${
              currentView === item.id ? 'text-[#E50914]' : 'text-gray-500 group-hover:text-white'
            }`}>
              {item.icon}
            </span>
            <span className="font-medium tracking-wide text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        {userRole === 'admin' && (
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10">
            <Settings size={20} />
            <span className="text-sm font-medium">System Config</span>
          </button>
        )}
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};


import React, { useState } from 'react';
import { Terminal, User, ShieldCheck, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { User as UserType, Student } from '../types';
import { loginStudent } from '../services/supabaseService';

interface LoginProps {
  onLogin: (user: UserType) => void;
  students: Student[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, students }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>('admin');
  const [adminPass, setAdminPass] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simple mock authentication for Admin
    if (adminPass === 'admin123') {
      setTimeout(() => {
        onLogin({
          id: 'ADMIN_01',
          name: 'System Administrator',
          role: 'admin'
        });
      }, 800);
    } else {
      setTimeout(() => {
        setError('INVALID_ACCESS_KEY');
        setIsLoading(false);
      }, 500);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 1. Check local students first (faster)
    const localStudent = students.find(s => s.id === studentId);
    
    if (localStudent) {
       setTimeout(() => {
         onLogin({
           id: localStudent.id,
           name: localStudent.name,
           role: 'student',
           photoUrl: localStudent.photoUrl,
           className: localStudent.className
         });
       }, 800);
       return;
    }

    // 2. Fallback to Cloud Check
    const cloudUser = await loginStudent(studentId);
    if (cloudUser) {
      onLogin(cloudUser);
    } else {
      setError('IDENTITY_NOT_FOUND');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(229,9,20,0.05),transparent_70%)] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 mb-4 shadow-[0_0_30px_rgba(229,9,20,0.3)]">
            <Terminal size={32} className="text-[#E50914]" />
          </div>
          <h1 className="text-3xl font-bold text-white font-mono tracking-tight">Smart<span className="text-[#E50914]">Attend</span></h1>
          <p className="text-gray-500 text-xs font-mono mt-2 tracking-[0.2em] uppercase">Secure Access Gateway v2.0</p>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setActiveTab('admin'); setError(''); }}
              className={`flex-1 py-4 text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'admin' ? 'bg-[#E50914]/10 text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Admin Access
            </button>
            <button
              onClick={() => { setActiveTab('student'); setError(''); }}
              className={`flex-1 py-4 text-sm font-mono font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'student' ? 'bg-[#E50914]/10 text-[#E50914] border-b-2 border-[#E50914]' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              Student Portal
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase">Security Key</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      placeholder="Enter Admin Password"
                      className="w-full bg-black/50 border border-white/10 rounded py-3 pl-10 pr-4 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono">Hint: admin123</p>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-mono bg-red-500/10 p-3 rounded border border-red-500/20">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E50914] hover:bg-[#B20710] text-white py-3 rounded font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Authenticating...' : (
                    <>Initialize <ShieldCheck size={18} /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-400 uppercase">Student ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Ex: S001"
                      className="w-full bg-black/50 border border-white/10 rounded py-3 pl-10 pr-4 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-mono bg-red-500/10 p-3 rounded border border-red-500/20">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                >
                  {isLoading ? 'Searching...' : (
                    <>Access Profile <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

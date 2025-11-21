
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AttendanceCam } from './components/AttendanceCam';
import { Registration } from './components/Registration';
import { StudentList } from './components/StudentList';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { View, Student, AttendanceRecord, User } from './types';
import { MOCK_STUDENTS, INITIAL_ATTENDANCE } from './constants';
import { fetchStudents, fetchAttendanceLogs, checkDatabaseConnection, SETUP_SQL } from './services/supabaseService';
import { Menu, Loader, Database, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Initialize with Mock data, then overwrite with Cloud data if available
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // System Health
  const [missingTables, setMissingTables] = useState(false);

  // -- Effects --
  
  useEffect(() => {
    const initSystem = async () => {
      console.log("🔄 System: Initializing Cloud Connection...");
      
      // 1. Check Connection First
      const dbCheck = await checkDatabaseConnection();
      
      if (dbCheck.missingTables) {
        console.error("🚨 System: Database tables missing.");
        setMissingTables(true);
        setIsLoading(false);
        return;
      }

      // 2. Fetch Data if connected
      const [cloudStudents, cloudLogs] = await Promise.all([
        fetchStudents(),
        fetchAttendanceLogs()
      ]);

      if (cloudStudents && cloudStudents.length > 0) {
        console.log(`✅ System: Loaded ${cloudStudents.length} student identities from Cloud.`);
        setStudents(cloudStudents);
      } else {
        console.log("⚠️ System: No cloud data found, using local cache.");
      }

      if (cloudLogs && cloudLogs.length > 0) {
        console.log(`✅ System: Loaded ${cloudLogs.length} attendance records.`);
        setAttendanceRecords(cloudLogs);
      }

      setIsLoading(false);
    };

    initSystem();
  }, []);

  // -- Actions --

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect based on role
    if (user.role === 'admin') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleEditStudent = (student: Student) => {
    // Placeholder for edit functionality
  };

  const handleMarkAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [record, ...prev]);
  };

  // -- Sub Components --

  const DatabaseSetupModal = () => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="bg-[#111] border border-[#E50914] rounded-xl w-full max-w-2xl p-6 shadow-2xl relative">
           <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
             <Database size={28} className="text-[#E50914]" />
             <div>
               <h2 className="text-xl font-bold text-white font-mono">Database Setup Required</h2>
               <p className="text-gray-500 text-xs font-mono">Supabase tables are missing. Run the SQL below.</p>
             </div>
           </div>

           <div className="bg-black rounded-lg p-4 mb-4 border border-white/10 overflow-auto max-h-64 relative group">
             <pre className="text-xs font-mono text-green-500 whitespace-pre-wrap">
               {SETUP_SQL}
             </pre>
             <button 
               onClick={handleCopy}
               className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs font-mono flex items-center gap-2 transition-all border border-white/10"
             >
               {copied ? <Check size={14} /> : <Copy size={14} />}
               {copied ? 'COPIED' : 'COPY SQL'}
             </button>
           </div>

           <div className="flex justify-end gap-3">
             <button 
               onClick={() => window.location.reload()}
               className="bg-[#E50914] hover:bg-[#B20710] text-white px-6 py-3 rounded font-mono text-sm font-medium"
             >
               I've Run the SQL (Refresh)
             </button>
           </div>
        </div>
      </div>
    );
  };

  // -- Render Loading --

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-4">
        <div className="relative">
           <div className="w-12 h-12 border-2 border-[#E50914] rounded-full animate-ping absolute opacity-20"></div>
           <Loader className="text-[#E50914] animate-spin" size={48} />
        </div>
        <p className="text-white font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SECURE UPLINK...</p>
      </div>
    );
  }

  // -- Render Setup Modal --
  if (missingTables) {
    return <DatabaseSetupModal />;
  }

  // -- Render Login --
  if (!currentUser) {
    return <Login onLogin={handleLogin} students={students} />;
  }

  // -- Render Main App --
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-mono relative overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
           <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#111] border-r border-white/10 z-50" onClick={e => e.stopPropagation()}>
             <Sidebar 
                currentView={currentView} 
                onChangeView={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} 
                userRole={currentUser.role}
                onLogout={handleLogout}
             />
           </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar 
         currentView={currentView} 
         onChangeView={setCurrentView} 
         userRole={currentUser.role}
         onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto relative z-10">
        
        {/* Mobile Header */}
        <header className="md:hidden glass-panel p-4 flex items-center justify-between sticky top-0 z-30 border-b border-white/10">
          <div className="flex items-center gap-3">
             <div className="text-[#E50914] font-bold text-xl tracking-tighter">&lt;SmartAttend /&gt;</div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-[#E50914]">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* Admin Views */}
          {currentUser.role === 'admin' && (
            <>
              {currentView === 'dashboard' && (
                <Dashboard students={students} records={attendanceRecords} />
              )}
              
              {currentView === 'attendance' && (
                <AttendanceCam 
                  students={students} 
                  onMarkAttendance={handleMarkAttendance} 
                  attendanceRecords={attendanceRecords}
                />
              )}
              
              {currentView === 'register' && (
                <Registration 
                  onRegister={handleAddStudent} 
                />
              )}

              {currentView === 'database' && (
                <StudentList
                  students={students}
                  onAdd={handleAddStudent}
                  onDelete={handleDeleteStudent}
                  onEdit={handleEditStudent}
                />
              )}
            </>
          )}

          {/* Student Views */}
          {currentUser.role === 'student' && (
            <>
              {currentView === 'student-dashboard' && (
                <StudentDashboard 
                  user={currentUser} 
                  records={attendanceRecords} 
                />
              )}
              
              {currentView === 'attendance' && (
                <AttendanceCam 
                  students={students} 
                  onMarkAttendance={handleMarkAttendance} 
                  attendanceRecords={attendanceRecords}
                  targetStudent={{ id: currentUser.id, name: currentUser.name }}
                  onExit={() => setCurrentView('student-dashboard')}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 text-center bg-[#0a0a0a]/80 backdrop-blur">
          <p className="text-gray-600 text-[10px] font-mono uppercase tracking-[0.2em]">
            System Designed & Developed by <span className="text-[#E50914] font-bold">Harshith Gowda M</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;

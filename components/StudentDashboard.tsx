
import React from 'react';
import { User, AttendanceRecord, Status } from '../types';
import { Calendar, CheckCircle, XCircle, Clock, UserCircle } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  records: AttendanceRecord[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, records }) => {
  // Filter records for this specific student
  const myRecords = records.filter(r => r.studentId === user.id);
  
  // Calculate stats
  const totalDays = myRecords.length; // Simplified: assuming one record per day for demo
  const presentDays = myRecords.filter(r => r.status === Status.PRESENT).length;
  const absentDays = myRecords.filter(r => r.status === Status.ABSENT).length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';

  // Get today's status
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = myRecords.find(r => r.date === today);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#E50914] overflow-hidden bg-gray-800">
            <img 
              src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">{user.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-400 font-mono">
               <span className="bg-white/5 px-2 py-1 rounded border border-white/10">ID: {user.id}</span>
               <span className="bg-white/5 px-2 py-1 rounded border border-white/10">{user.className || 'Student'}</span>
            </div>
          </div>
        </div>
        
        {/* Today's Status Badge */}
        <div className={`px-6 py-3 rounded-lg border flex items-center gap-3 font-mono uppercase tracking-wider ${
          todayRecord?.status === Status.PRESENT 
            ? 'bg-green-500/10 border-green-500/30 text-green-500' 
            : 'bg-gray-800 border-gray-700 text-gray-500'
        }`}>
           {todayRecord?.status === Status.PRESENT ? <CheckCircle size={20} /> : <Clock size={20} />}
           <span>Today: {todayRecord?.status || 'NOT MARKED'}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border-t-4 border-[#E50914]">
          <p className="text-gray-500 text-xs uppercase font-mono">Attendance Rate</p>
          <h3 className="text-4xl font-bold text-white mt-2 font-mono">{attendancePercentage}%</h3>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-green-500">
          <p className="text-gray-500 text-xs uppercase font-mono">Days Present</p>
          <h3 className="text-4xl font-bold text-white mt-2 font-mono">{presentDays}</h3>
        </div>
        <div className="glass-panel p-6 rounded-xl border-t-4 border-red-500">
          <p className="text-gray-500 text-xs uppercase font-mono">Days Absent</p>
          <h3 className="text-4xl font-bold text-white mt-2 font-mono">{absentDays}</h3>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Calendar size={18} className="text-[#E50914]" />
          <h3 className="font-bold text-white font-mono">Attendance History</h3>
        </div>
        
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-mono text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-mono text-gray-400 uppercase">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {myRecords.length > 0 ? (
              myRecords.map((record) => (
                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-white">{record.date}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-400">
                    {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-mono uppercase ${
                      record.status === Status.PRESENT 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {record.status === Status.PRESENT ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">
                    {record.confidence.toFixed(1)}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-600 font-mono text-sm">
                  NO RECORDS FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

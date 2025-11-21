import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Users, UserCheck, UserX, Activity } from 'lucide-react';
import { AttendanceRecord, Student, Status } from '../types';
import { COLORS } from '../constants';

interface DashboardProps {
  students: Student[];
  records: AttendanceRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ students, records }) => {
  // --- Statistics Calculation ---
  const today = new Date().toISOString().split('T')[0];
  const totalStudents = students.length;
  
  const todaysRecords = records.filter(r => r.date === today);
  const presentTodaySet = new Set(todaysRecords.filter(r => r.status === Status.PRESENT).map(r => r.studentId));
  const presentToday = presentTodaySet.size;
  const absentToday = totalStudents - presentToday;
  const attendanceRate = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : '0';

  // --- Chart Data ---
  const weeklyData = [
    { name: 'Mon', present: 4, absent: 1 },
    { name: 'Tue', present: 5, absent: 0 },
    { name: 'Wed', present: 3, absent: 2 },
    { name: 'Thu', present: 5, absent: 0 },
    { name: 'Fri', present: 4, absent: 1 },
    { name: 'Sat', present: 0, absent: 0 },
    { name: 'Sun', present: 0, absent: 0 },
  ];

  const classData = [
    { name: '10-A', attendance: 85 },
    { name: '10-B', attendance: 92 },
    { name: '11-A', attendance: 78 },
  ];

  const StatCard = ({ title, value, icon: Icon, glowColor, subValue }: any) => (
    <div className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${glowColor}-500/10 rounded-full blur-2xl group-hover:bg-${glowColor}-500/20 transition-all`}></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-mono">{value}</h3>
          {subValue && <p className="text-[10px] text-gray-400 mt-2 border-l-2 border-[#E50914] pl-2">{subValue}</p>}
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">System Overview</h2>
          <p className="text-sm text-gray-500">Real-time analytics stream</p>
        </div>
        <div className="text-xs text-[#E50914] font-mono border border-[#E50914]/30 bg-[#E50914]/5 px-3 py-1 rounded-full animate-pulse">
          ● LIVE FEED
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Subjects" 
          value={totalStudents} 
          icon={Users} 
          glowColor="blue" 
          subValue="Registered IDs"
        />
        <StatCard 
          title="Confirmed Present" 
          value={presentToday} 
          icon={UserCheck} 
          glowColor="emerald"
          subValue="Biometric Match"
        />
        <StatCard 
          title="Not Detected" 
          value={absentToday} 
          icon={UserX} 
          glowColor="rose"
          subValue="Pending Scan"
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${attendanceRate}%`} 
          icon={Activity} 
          glowColor="violet"
          subValue="Daily Metric"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Trend */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E50914] rounded-full"></span>
            Weekly Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="step" 
                  dataKey="present" 
                  stroke="#E50914" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#0a0a0a', strokeWidth: 2, stroke: '#E50914' }}
                  activeDot={{ r: 6, fill: '#E50914' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Performance */}
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6 flex items-center gap-2">
             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
             Class Metrics
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#0a0a0a', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
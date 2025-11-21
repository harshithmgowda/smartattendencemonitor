
import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Search, Trash2, Edit2, Database, ChevronDown } from 'lucide-react';
import { BRANCHES, SEMESTERS, SECTIONS } from '../constants';

interface StudentListProps {
  students: Student[];
  onAdd: (student: Student) => void;
  onDelete: (id: string) => void;
  onEdit: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, onAdd, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    branch: BRANCHES[0],
    semester: '3',
    section: 'A',
    photoUrl: 'https://picsum.photos/200'
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.id) {
      
      const branchShort = formData.branch.match(/\(([^)]+)\)/)?.[1] || formData.branch;
      const className = `${branchShort} - Sem ${formData.semester} - ${formData.section}`;

      onAdd({
        id: formData.id,
        name: formData.name,
        className: className,
        photoUrl: formData.photoUrl || 'https://picsum.photos/200'
      });
      setIsModalOpen(false);
      setFormData({ ...formData, name: '', id: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <Database size={24} className="text-[#E50914]" />
            Student_Database
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">Manage registered identities.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#E50914] hover:bg-[#B20710] text-white px-6 py-2 rounded-sm font-mono text-sm font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:shadow-[0_0_20px_rgba(229,9,20,0.5)]"
        >
          <Plus size={18} /> Add_Entry
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel p-3 rounded-lg flex items-center gap-3 border border-white/10 focus-within:border-[#E50914]/50 transition-colors">
        <Search className="text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="Query by Name or ID (e.g. 02JST...)" 
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 font-mono text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Identity</th>
              <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">ID_Ref</th>
              <th className="px-6 py-4 text-left text-xs font-mono text-gray-400 uppercase tracking-wider">Group</th>
              <th className="px-6 py-4 text-right text-xs font-mono text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 group-hover:border-[#E50914] transition-colors">
                      <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium text-gray-200 group-hover:text-white group-hover:text-glow transition-all font-mono">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">{student.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {student.className}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(student.id)}
                      className="p-2 text-gray-500 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-600 font-mono text-sm">
                  NO_RECORDS_FOUND
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel bg-[#111] border border-white/10 rounded-xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative top line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E50914] to-transparent"></div>
            
            <h3 className="text-xl font-bold text-white mb-6 font-mono flex items-center gap-2">
              <Plus size={20} className="text-[#E50914]" />
              New Entry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded bg-black/50 border border-white/10 text-white focus:border-[#E50914] outline-none transition-colors font-mono text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase">Student ID</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded bg-black/50 border border-white/10 text-white focus:border-[#E50914] outline-none transition-colors font-mono text-sm"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  placeholder="ex: 02JST24UCS043"
                />
              </div>
              
              <div>
               <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-2">Branch</label>
               <div className="relative">
                 <select 
                   value={formData.branch}
                   onChange={e => setFormData({...formData, branch: e.target.value})}
                   className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors appearance-none"
                 >
                   {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                 </select>
                 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-2">Semester</label>
                 <div className="relative">
                   <select 
                     value={formData.semester}
                     onChange={e => setFormData({...formData, semester: e.target.value})}
                     className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors appearance-none"
                   >
                     {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-mono text-gray-500 uppercase tracking-wider block mb-2">Section</label>
                 <div className="relative">
                   <select 
                     value={formData.section}
                     onChange={e => setFormData({...formData, section: e.target.value})}
                     className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors appearance-none"
                   >
                     {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                 </div>
               </div>
             </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-400 font-mono text-sm hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[#E50914] text-white font-mono text-sm font-medium rounded hover:bg-[#B20710] transition-all hover:shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  SAVE_RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

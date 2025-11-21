
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Save, RefreshCw, UserPlus, CheckCircle, Aperture, ChevronDown, AlertTriangle } from 'lucide-react';
import { Student } from '../types';
import { registerStudentToCloud } from '../services/supabaseService';
import { BRANCHES, SEMESTERS, SECTIONS } from '../constants';

interface RegistrationProps {
  onRegister: (student: Student) => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    branch: BRANCHES[0],
    semester: '3',
    section: 'A'
  });
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Start camera function
  const startCamera = async () => {
    try {
      setCapturedImage(null);
      setIsCameraActive(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.error("Play error:", e);
        }
      }
    } catch (err) {
      console.error("Camera failed", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id || !capturedImage) return;

    setStatus('saving');
    setErrorMsg('');

    // Construct className from components
    // Extract short branch name e.g. "Computer Science (CSE)" -> "CSE"
    const branchShort = formData.branch.match(/\(([^)]+)\)/)?.[1] || formData.branch;
    const className = `${branchShort} - Sem ${formData.semester} - ${formData.section}`;

    const newStudent: Student = {
      id: formData.id.toUpperCase(), // Ensure ID is uppercase
      name: formData.name,
      className: className,
      photoUrl: capturedImage
    };

    console.log("🚀 Registration: Attempting to register:", newStudent.id);

    // Register to local state (Optimistic update)
    onRegister(newStudent);
    
    // Simulate Cloud Sync
    try {
      const success = await registerStudentToCloud(newStudent);
      if (success) {
        setStatus('success');
        setTimeout(() => {
          setFormData({ ...formData, name: '', id: '' });
          setCapturedImage(null);
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
        setErrorMsg('Database sync failed. Check console for SQL setup.');
      }
    } catch (error) {
      console.error("Registration Exception:", error);
      setStatus('error');
      setErrorMsg('Network or Server error.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
            <UserPlus size={24} className="text-[#E50914]" />
            Identity_Registration
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">Enroll new subject into biometric database.</p>
        </div>
        <div className="text-xs font-mono text-gray-500">
          SECURE TERMINAL // V2.0
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="glass-panel p-8 rounded-xl border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#E50914]"></div>
           
           <form onSubmit={handleSubmit} className="space-y-6">
             
             <div className="space-y-2">
               <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Full Name</label>
               <input 
                 type="text"
                 required
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors placeholder-gray-700"
                 placeholder="ex: Harshith Gowda M"
               />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Student USN / ID</label>
               <input 
                 type="text"
                 required
                 value={formData.id}
                 onChange={e => setFormData({...formData, id: e.target.value.toUpperCase()})}
                 className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono focus:border-[#E50914] focus:outline-none transition-colors placeholder-gray-700 uppercase"
                 placeholder="ex: 02JST24UCS043"
               />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Branch</label>
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
                 <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Semester</label>
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
                 <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">Section</label>
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

             <div className="pt-6 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={!capturedImage || status === 'saving'}
                  className={`w-full py-4 rounded font-mono text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                    ${!capturedImage || status === 'saving' 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#E50914] text-white hover:bg-[#B20710] hover:shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                    }`}
                >
                  {status === 'saving' ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} /> Uploading...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle size={18} /> Registration Complete
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Register Identity
                    </>
                  )}
                </button>
                {status === 'success' && (
                  <p className="text-center text-green-500 text-xs font-mono mt-3 animate-pulse">
                    // DATA SYNCED TO SUPABASE NODE //
                  </p>
                )}
                {status === 'error' && (
                  <div className="mt-3 text-center">
                    <p className="text-red-500 text-xs font-mono flex items-center justify-center gap-1">
                      <AlertTriangle size={12} /> // ERROR: UPLOAD FAILED //
                    </p>
                    {errorMsg && <p className="text-gray-500 text-[10px] mt-1">{errorMsg}</p>}
                  </div>
                )}
             </div>
           </form>
        </div>

        {/* Right Column: Camera */}
        <div className="space-y-4">
           <div className="bg-black rounded-xl overflow-hidden border border-white/10 aspect-video relative flex items-center justify-center shadow-2xl group">
              {/* Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20" 
                  style={{backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px'}}>
              </div>

              {/* The Image Capture State */}
              {capturedImage && (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover relative z-10" />
              )}

              {/* The Video Stream - Always Rendered but potentially hidden */}
              <video 
                ref={videoRef} 
                className={`w-full h-full object-cover absolute inset-0 ${(!isCameraActive || capturedImage) ? 'invisible' : 'visible'}`} 
                muted 
                playsInline 
                autoPlay
              />

              {/* Idle State */}
              {!isCameraActive && !capturedImage && (
                <div className="text-center relative z-10">
                  <Aperture size={48} className="text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-mono text-sm">CAMERA_OFFLINE</p>
                </div>
              )}

              {/* Face Guides */}
              {isCameraActive && !capturedImage && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                  <div className="w-48 h-64 border-2 border-[#E50914]/50 rounded-full"></div>
                  <div className="absolute w-64 h-1 bg-[#E50914]/20 top-1/2 -translate-y-1/2"></div>
                  <div className="absolute h-64 w-1 bg-[#E50914]/20 left-1/2 -translate-x-1/2"></div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
           </div>

           <div className="flex gap-4">
             {!isCameraActive && !capturedImage && (
               <button 
                 onClick={startCamera}
                 className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm rounded transition-all hover:border-white/30"
               >
                 INITIALIZE_CAMERA
               </button>
             )}
             
             {isCameraActive && (
               <button 
                 onClick={capturePhoto}
                 className="flex-1 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-mono text-sm rounded transition-all shadow-[0_0_15px_rgba(229,9,20,0.3)]"
               >
                 CAPTURE_FRAME
               </button>
             )}

             {capturedImage && (
               <button 
                 onClick={handleRetake}
                 disabled={status === 'saving'}
                 className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm rounded transition-all"
               >
                 RETRY_SCAN
               </button>
             )}
           </div>

           <div className="glass-panel p-4 rounded-lg border border-white/5">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instructions</h4>
             <ul className="text-[10px] text-gray-500 font-mono space-y-1 list-disc pl-4">
               <li>Ensure subject is facing forward within the guides.</li>
               <li>Lighting should be even; avoid strong backlighting.</li>
               <li>Subject ID will be linked to biometric data for future recognition.</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

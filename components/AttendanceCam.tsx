
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Wifi, WifiOff, CheckCircle, AlertTriangle, Crosshair, Radio, LogOut } from 'lucide-react';
import { Student, AttendanceRecord, Status, IotDeviceStatus } from '../types';
import { detectFace } from '../services/mockAiService';
import { syncAttendanceToCloud } from '../services/supabaseService';

interface AttendanceCamProps {
  students: Student[];
  onMarkAttendance: (record: AttendanceRecord) => void;
  attendanceRecords?: AttendanceRecord[]; // Passed to check for duplicates
  targetStudent?: { id: string; name: string }; // If set, we are in 1:1 Verification mode
  onExit?: () => void; // Callback to exit the camera view
}

export const AttendanceCam: React.FC<AttendanceCamProps> = ({
  students,
  onMarkAttendance,
  attendanceRecords = [],
  targetStudent,
  onExit
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [iotStatus, setIotStatus] = useState<IotDeviceStatus>({ connected: false, active: false });
  const [lastRecognition, setLastRecognition] = useState<{ name: string, confidence: number, status?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 6)]);

  // Connect Camera
  const connectCamera = async () => {
    // Security Check
    if (!window.isSecureContext) {
      addLog('CRITICAL: Insecure Context. Camera requires HTTPS or localhost.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        addLog('SYSTEM: Requesting Camera Access...');
        // Add constraints for better compatibility
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIotStatus({ connected: true, active: true, ipAddress: '192.168.1.105' });
        addLog('SYSTEM_INIT: Camera Module Online');
      } else {
        addLog('ERROR: navigator.mediaDevices not supported');
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      let errorMessage = 'Unknown Error';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permission Denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No Camera Found. Check device connection.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera In Use or Hardware Error.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not satisfied.';
      } else if (err.message) {
        errorMessage = `${err.name}: ${err.message}`;
      }

      addLog(`ERROR: Connection Failed - ${errorMessage}`);
    }
  };

  const disconnectCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIotStatus({ connected: false, active: false });
    addLog('SYSTEM: Camera Disconnected');
    setLastRecognition(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // --- Debug Simulation ---
  // Force the AI to "detect" a specific student (Useful for testing)
  const simulateDetection = (forceStudentId?: string) => {
    if (!iotStatus.connected) {
      addLog("ERROR: Connect Camera first");
      return;
    }

    const studentToDetect = forceStudentId
      ? students.find(s => s.id === forceStudentId)
      : students[Math.floor(Math.random() * students.length)];

    if (studentToDetect) {
      addLog(`DEBUG: Simulating detection of ${studentToDetect.name}`);
      handleAttendanceSuccess(studentToDetect, 99.9);
    } else {
      addLog("DEBUG: No students to simulate");
    }
  };

  // Recognition Loop
  useEffect(() => {
    let interval: any;

    if (iotStatus.active && iotStatus.connected && !isRedirecting) {
      interval = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Ensure video is ready
        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        // Sync canvas size with video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Dark Overlay Effect on Video to make HUD pop
        ctx.fillStyle = 'rgba(0, 10, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Run Detection
        // Pass targetStudent.id if we are in 1:1 mode
        const result = detectFace(students, canvas.width, canvas.height, targetStudent?.id);

        // Set Font for HUD
        ctx.font = 'bold 16px "IBM Plex Mono"';

        if (result) {
          // Determine Status based on duplication
          let statusColor = '#10b981'; // Green (Success)
          let boxLabel = result.student ? `MATCH: ${result.student.name}` : 'UNKNOWN_ENTITY';

          if (!result.student) {
            statusColor = '#ef4444'; // Red (Unknown)
          } else {
            // Check duplication
            const today = new Date().toISOString().split('T')[0];
            const isAlreadyPresent = attendanceRecords.some(
              r => r.studentId === result.student!.id && r.date === today && r.status === Status.PRESENT
            );

            if (isAlreadyPresent) {
              statusColor = '#f59e0b'; // Yellow (Duplicate)
              boxLabel = `ALREADY LOGGED: ${result.student.name}`;
            }
          }

          // HUD Box
          ctx.strokeStyle = statusColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(result.box.x, result.box.y, result.box.width, result.box.height);

          // HUD Corners
          const cornerLen = 20;
          ctx.lineWidth = 4;
          ctx.beginPath();

          // Top Left
          ctx.moveTo(result.box.x, result.box.y + cornerLen);
          ctx.lineTo(result.box.x, result.box.y);
          ctx.lineTo(result.box.x + cornerLen, result.box.y);

          // Bottom Right
          ctx.moveTo(result.box.x + result.box.width, result.box.y + result.box.height - cornerLen);
          ctx.lineTo(result.box.x + result.box.width, result.box.y + result.box.height);
          ctx.lineTo(result.box.x + result.box.width - cornerLen, result.box.y + result.box.height);

          ctx.stroke();

          // Label Background
          const textMetrics = ctx.measureText(boxLabel);
          ctx.fillStyle = statusColor;
          ctx.fillRect(result.box.x, result.box.y - 25, textMetrics.width + 10, 20);

          // Label Text
          ctx.fillStyle = '#000';
          ctx.fillText(boxLabel, result.box.x + 5, result.box.y - 10);

          // Confidence Bar
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(result.box.x, result.box.y + result.box.height + 10, result.box.width, 8);
          ctx.fillStyle = statusColor;
          ctx.fillRect(result.box.x, result.box.y + result.box.height + 10, result.box.width * (result.confidence / 100), 8);

          setLastRecognition({
            name: result.student?.name || 'Unknown',
            confidence: result.confidence,
            status: statusColor === '#f59e0b' ? 'Duplicate' : statusColor === '#ef4444' ? 'Unknown' : 'Success'
          });

          // Trigger Action if High Confidence & Not Unknown
          if (result.student && result.confidence > 85) {
            // If not duplicating OR if duplications are allowed (Admin mode usually wants to see it anyway)
            // For logic: If duplicate, we still "Detect" but maybe don't "Sync"
            // But handleAttendanceSuccess handles the sync.

            // Debounce: Don't spam
            handleAttendanceSuccess(result.student, result.confidence);
          }
        } else {
          // Scanning reticle when idle
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy);
          ctx.lineTo(cx + 20, cy);
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx, cy + 20);
          ctx.stroke();

          setLastRecognition(null);
        }

      }, 800);
    }

    return () => clearInterval(interval);
  }, [iotStatus, students, attendanceRecords, isRedirecting, targetStudent]);

  const handleAttendanceSuccess = useCallback(async (student: Student, confidence: number) => {
    const today = new Date().toISOString().split('T')[0];

    // Check Duplication
    const isAlreadyPresent = attendanceRecords.some(
      r => r.studentId === student.id && r.date === today && r.status === Status.PRESENT
    );

    if (isAlreadyPresent) {
      // Just Log locally, don't sync
      addLog(`INFO: ${student.name} already marked.`);

      // If in Auto-Exit mode (Target Student Mode), we still treat this as "Done" and exit
      if (targetStudent && onExit && !isRedirecting) {
        setIsRedirecting(true);
        addLog("REDIRECT: Attendance confirmed. Exiting...");
        setTimeout(() => {
          disconnectCamera();
          onExit();
        }, 2000);
      }
      return;
    }

    // Process New Attendance
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      timestamp: new Date().toISOString(),
      date: today,
      status: Status.PRESENT,
      confidence
    };

    onMarkAttendance(record);
    addLog(`SUCCESS: Verified ${student.id} - ${student.name}`);

    setSyncStatus('syncing');
    try {
      const saved = await syncAttendanceToCloud(record);
      if (saved) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }

      // Auto Exit Logic for Single Shot Mode
      if (targetStudent && onExit && !isRedirecting) {
        setIsRedirecting(true);
        setTimeout(() => {
          setSyncStatus('idle');
          disconnectCamera();
          onExit();
        }, 2000);
      } else {
        setTimeout(() => setSyncStatus('idle'), 3000);
      }

    } catch (e) {
      setSyncStatus('error');
    }
  }, [onMarkAttendance, attendanceRecords, targetStudent, onExit, isRedirecting]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] animate-fade-in">

      {/* Camera Feed */}
      <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-2xl flex items-center justify-center border border-white/10">
        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        {/* Loading / Redirecting Overlay */}
        {isRedirecting && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h2 className="text-2xl text-white font-mono font-bold">IDENTITY VERIFIED</h2>
            <p className="text-gray-400 font-mono text-sm mt-2">Redirecting to dashboard...</p>
          </div>
        )}

        {!iotStatus.connected && !isRedirecting && (
          <div className="text-center text-gray-500 z-10">
            <div className="w-20 h-20 border-2 border-dashed border-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Camera size={32} className="opacity-50" />
            </div>
            <h3 className="text-xl font-mono font-bold text-gray-300 mb-2 tracking-widest">NO_SIGNAL</h3>
            <p className="mb-8 text-xs font-mono text-gray-600">INITIATE CAMERA MODULE CONNECTION</p>
            <button
              onClick={connectCamera}
              className="bg-[#E50914] hover:bg-[#B20710] text-white px-8 py-3 rounded-sm font-mono text-sm transition-all flex items-center gap-2 mx-auto hover:shadow-[0_0_15px_rgba(229,9,20,0.5)]"
            >
              <Wifi size={16} /> CONNECT_SOURCE
            </button>
          </div>
        )}

        <video ref={videoRef} className={`absolute inset-0 w-full h-full object-cover ${!iotStatus.connected ? 'hidden' : ''}`} muted playsInline />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Scanning Line Animation */}
        {iotStatus.connected && (
          <div className="absolute left-0 right-0 h-1 bg-[#E50914]/50 shadow-[0_0_15px_rgba(229,9,20,0.8)] pointer-events-none animate-scan z-20"></div>
        )}

        {/* Status Overlay */}
        {iotStatus.connected && (
          <>
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-30">
              <div className="bg-black/60 backdrop-blur border border-[#E50914]/30 text-[#E50914] text-xs font-mono px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#E50914] rounded-full animate-pulse"></div>
                REC :: {iotStatus.ipAddress}
                {targetStudent && <span className="ml-2 text-white border-l border-white/20 pl-2">TARGET: {targetStudent.name}</span>}
              </div>
              <button
                onClick={disconnectCamera}
                className="bg-red-900/50 hover:bg-red-900 text-white p-2 border border-red-500/30 transition-colors"
                title="Disconnect"
              >
                <WifiOff size={16} />
              </button>
            </div>
          </>
        )}

        {/* Sync Toast */}
        {syncStatus !== 'idle' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 text-white px-6 py-3 flex items-center gap-3 z-30">
            {syncStatus === 'syncing' && <RefreshCw className="animate-spin text-blue-500" size={16} />}
            {syncStatus === 'synced' && <CheckCircle className="text-green-500" size={16} />}
            {syncStatus === 'error' && <AlertTriangle className="text-red-500" size={16} />}
            <span className="font-mono text-xs uppercase tracking-wider">
              {syncStatus === 'syncing' ? 'UPLOADING_DATA...' :
                syncStatus === 'synced' ? 'SYNC_COMPLETE' : 'UPLOAD_FAILED'}
            </span>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-6">

        {/* Recognition Analysis */}
        <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col border border-white/10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <Radio size={16} className="text-[#E50914]" />
            Analysis Stream
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-gray-800 bg-black/40 rounded-lg mb-4 relative overflow-hidden">
            {lastRecognition ? (
              <div className="text-center w-full relative z-10">
                <div className={`w-24 h-24 border-2 ${lastRecognition.status === 'Unknown' ? 'border-red-500' :
                  lastRecognition.status === 'Duplicate' ? 'border-yellow-500' : 'border-green-500'
                  } rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-white/5`}>
                  <span className="text-4xl font-mono">{lastRecognition.name.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 font-mono">{lastRecognition.name}</h2>
                <div className="w-full bg-gray-800 h-2 mt-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${lastRecognition.status === 'Unknown' ? 'bg-red-500' :
                      lastRecognition.status === 'Duplicate' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${lastRecognition.confidence}%` }}
                  ></div>
                </div>
                <p className="text-xs font-mono text-gray-500 mt-2">CONFIDENCE: {lastRecognition.confidence.toFixed(2)}%</p>
              </div>
            ) : (
              <div className="text-center text-gray-600 font-mono text-xs">
                <div className="animate-pulse">WAITING FOR INPUT...</div>
              </div>
            )}
          </div>

          {/* Debug Controls (Only visible in Admin mode or Dev) */}
          {!targetStudent && (
            <div className="grid grid-cols-2 gap-2">
              <button
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs font-mono py-2 transition-all"
                onClick={() => simulateDetection()}
                disabled={!iotStatus.connected}
              >
                [DEBUG] Any
              </button>
              <button
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs font-mono py-2 transition-all"
                onClick={() => simulateDetection(students[0]?.id)}
                disabled={!iotStatus.connected}
              >
                [DEBUG] Specific
              </button>
            </div>
          )}

          {targetStudent && (
            <div className="text-center text-xs text-gray-500 font-mono mt-2 border-t border-white/10 pt-2">
              MODE: SELF_VERIFICATION
              <br />
              ID: {targetStudent.id}
            </div>
          )}
        </div>

        {/* Terminal Logs */}
        <div className="bg-[#050505] p-4 rounded-xl border border-white/10 h-64 overflow-hidden font-mono text-xs flex flex-col">
          <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
            <span className="text-gray-500 uppercase">Terminal Output</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {logs.length === 0 && <span className="text-gray-700 blink">_</span>}
            {logs.map((log, i) => (
              <div key={i} className="text-gray-400 hover:text-white transition-colors">
                <span className="text-[#E50914] mr-2">&gt;</span>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

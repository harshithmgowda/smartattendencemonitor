
import { Student, AttendanceRecord, Status } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: '02JST24UCS043', name: 'Alice Johnson', className: 'CSE - Sem 3 - A', photoUrl: 'https://picsum.photos/id/64/200/200' },
  { id: '02JST24UIS012', name: 'Bob Smith', className: 'ISE - Sem 3 - B', photoUrl: 'https://picsum.photos/id/91/200/200' },
  { id: '02JST24UEC088', name: 'Charlie Davis', className: 'ECE - Sem 5 - A', photoUrl: 'https://picsum.photos/id/103/200/200' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'REC001', studentId: '02JST24UCS043', studentName: 'Alice Johnson', timestamp: new Date(Date.now() - 86400000).toISOString(), date: '2023-10-26', status: Status.PRESENT, confidence: 98.5 },
  { id: 'REC002', studentId: '02JST24UIS012', studentName: 'Bob Smith', timestamp: new Date(Date.now() - 86400000).toISOString(), date: '2023-10-26', status: Status.ABSENT, confidence: 0 },
];

export const BRANCHES = [
  "Computer Science & Engineering (CSE)",
  "Computer Science & Business Systems (CSBS)",
  "Information Science & Engineering (ISE)",
  "Electronics & Communication Engineering (ECE)",
  "Civil Engineering (CV)",
  "Mechanical Engineering (ME)",
  "Biotechnology (BT)",
  "Construction Technology & Management (CTM)",
  "Industrial & Production Engineering (IPE)"
];

export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const SECTIONS = ["A", "B", "C", "D", "E", "F"];

// Updated for Dark Theme
export const COLORS = {
  primary: '#E50914', // Red Accent
  secondary: '#0a0a0a', // Dark Background
  success: '#10b981', // Emerald for success
  danger: '#E50914', // Red for danger/primary brand
  warning: '#f59e0b', // Amber
  background: '#0a0a0a',
  surface: '#1a1a1a', // Slightly lighter dark
  text: '#f0f0f0',
  muted: '#64748b'
};

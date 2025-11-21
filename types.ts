
export enum Status {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late'
}

export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  photoUrl?: string;
  className?: string;
}

export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  className: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD for grouping
  status: Status;
  confidence: number;
}

export interface IotDeviceStatus {
  connected: boolean;
  active: boolean;
  ipAddress?: string;
}

export type View = 'dashboard' | 'attendance' | 'register' | 'database' | 'student-dashboard';

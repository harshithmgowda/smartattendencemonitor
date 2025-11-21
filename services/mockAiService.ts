
import { Student } from '../types';

interface RecognitionResult {
  student?: Student;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}


export const detectFace = (
  students: Student[],
  width: number,
  height: number,
  targetStudentId?: string
): RecognitionResult | null => {


  const detectionChance = targetStudentId ? 0.95 : 0.8;
  const isFaceDetected = Math.random() < detectionChance;

  if (!isFaceDetected) return null;


  const boxSize = Math.min(width, height) * 0.4;
  const x = (width - boxSize) / 2 + (Math.random() * 40 - 20);
  const y = (height - boxSize) / 2 + (Math.random() * 40 - 20);

  if (targetStudentId) {

    const isMatch = Math.random() < 0.9;

    if (isMatch) {
      const targetStudent = students.find(s => s.id === targetStudentId);
      if (targetStudent) {
        return {
          student: targetStudent,
          confidence: 88 + Math.random() * 11,
          box: { x, y, width: boxSize, height: boxSize }
        };
      }
    }


    return {
      student: undefined,
      confidence: 20 + Math.random() * 30,
      box: { x, y, width: boxSize, height: boxSize }
    };

  } else {

    const isKnown = Math.random() > 0.3;

    if (isKnown && students.length > 0) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const confidence = 85 + Math.random() * 14.9;
      return {
        student: randomStudent,
        confidence,
        box: { x, y, width: boxSize, height: boxSize }
      };
    } else {

      return {
        student: undefined,
        confidence: 40 + Math.random() * 20,
        box: { x, y, width: boxSize, height: boxSize }
      };
    }
  }
};

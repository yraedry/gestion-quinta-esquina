export interface ClassSession {
  id: number;
  title: string;
  date: string;
  instructor: string;
  capacity: number;
}

export type EnrollmentStatus = 'confirmed' | 'waitlist';

export interface Enrollment {
  id: number;
  classId: number;
  userId: number;
  status: EnrollmentStatus;
  createdAt: string;
}

import { ClassSession, Enrollment, EnrollmentStatus } from '../entities/class-session.js';
import { User } from '../entities/user.js';

export interface ClassRepository {
  listClasses(): Promise<ClassSession[]>;
  findById(id: number): Promise<ClassSession | undefined>;
  updateCapacity(id: number, capacity: number): Promise<void>;
  seedDefaults(): Promise<void>;
}

export interface EnrollmentRepository {
  findByClassAndUser(classId: number, userId: number): Promise<Enrollment | undefined>;
  countConfirmed(classId: number): Promise<number>;
  createEnrollment(input: Omit<Enrollment, 'id'>): Promise<void>;
  deleteEnrollment(classId: number, userId: number): Promise<void>;
  listByClass(classId: number): Promise<(Enrollment & { user: Pick<User, 'id' | 'name'> })[]>;
  listWaitlistByClass(classId: number, limit: number): Promise<Enrollment[]>;
  updateStatus(enrollmentId: number, status: EnrollmentStatus): Promise<void>;
}

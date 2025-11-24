import { getDb } from '../db/sqlite-connection.js';
import { ClassRepository, EnrollmentRepository } from '../../domain/repositories/class-repository.js';
import { ClassSession, Enrollment, EnrollmentStatus } from '../../domain/entities/class-session.js';

export class SqliteClassRepository implements ClassRepository {
  async listClasses(): Promise<ClassSession[]> {
    const db = await getDb();
    return db.all<ClassSession[]>(`SELECT * FROM classes ORDER BY date ASC`);
  }

  async findById(id: number): Promise<ClassSession | undefined> {
    const db = await getDb();
    const cls = await db.get<ClassSession>(`SELECT * FROM classes WHERE id = ?`, id);
    return cls || undefined;
  }

  async updateCapacity(id: number, capacity: number): Promise<void> {
    const db = await getDb();
    await db.run(`UPDATE classes SET capacity = ? WHERE id = ?`, capacity, id);
  }

  async seedDefaults(): Promise<void> {
    // No-op, handled by initSchema seed
    return Promise.resolve();
  }
}

export class SqliteEnrollmentRepository implements EnrollmentRepository {
  async findByClassAndUser(classId: number, userId: number): Promise<Enrollment | undefined> {
    const db = await getDb();
    const enrollment = await db.get<Enrollment>(
      `SELECT * FROM enrollments WHERE classId = ? AND userId = ?`,
      classId,
      userId
    );
    return enrollment || undefined;
  }

  async countConfirmed(classId: number): Promise<number> {
    const db = await getDb();
    const row = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM enrollments WHERE classId = ? AND status = 'confirmed'`,
      classId
    );
    return row?.count ?? 0;
  }

  async createEnrollment(input: Omit<Enrollment, 'id'>): Promise<void> {
    const db = await getDb();
    await db.run(
      `INSERT INTO enrollments (classId, userId, status, createdAt) VALUES (?, ?, ?, ?)`,
      input.classId,
      input.userId,
      input.status,
      input.createdAt
    );
  }

  async deleteEnrollment(classId: number, userId: number): Promise<void> {
    const db = await getDb();
    await db.run(`DELETE FROM enrollments WHERE classId = ? AND userId = ?`, classId, userId);
  }

  async listByClass(classId: number): Promise<(Enrollment & { user: { id: number; name: string } })[]> {
    const db = await getDb();
    const rows = await db.all<
      (Enrollment & { userId: number; userName: string })[]
    >(
      `SELECT e.*, u.id as userId, u.name as userName FROM enrollments e JOIN users u ON e.userId = u.id WHERE e.classId = ?`,
      classId
    );

    return rows.map(({ userName, userId, ...rest }) => ({
      ...rest,
      userId,
      user: { id: userId, name: userName }
    }));
  }

  async listWaitlistByClass(classId: number, limit: number): Promise<Enrollment[]> {
    const db = await getDb();
    return db.all<Enrollment[]>(
      `SELECT * FROM enrollments WHERE classId = ? AND status = 'waitlist' ORDER BY createdAt ASC LIMIT ?`,
      classId,
      limit
    );
  }

  async updateStatus(enrollmentId: number, status: EnrollmentStatus): Promise<void> {
    const db = await getDb();
    await db.run(`UPDATE enrollments SET status = ? WHERE id = ?`, status, enrollmentId);
  }
}

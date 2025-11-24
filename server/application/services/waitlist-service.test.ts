import { WaitlistService } from './waitlist-service.js';
import { ClassRepository, EnrollmentRepository } from '../../domain/repositories/class-repository.js';
import { ClassSession, Enrollment } from '../../domain/entities/class-session.js';

class InMemoryClassRepo implements ClassRepository {
  private sessions = new Map<number, ClassSession>();

  constructor(initial: ClassSession[]) {
    initial.forEach((s) => this.sessions.set(s.id, s));
  }

  async findById(id: number): Promise<ClassSession | undefined> {
    return this.sessions.get(id);
  }

  async updateCapacity(id: number, capacity: number): Promise<void> {
    const session = this.sessions.get(id);
    if (session) this.sessions.set(id, { ...session, capacity });
  }

  async listClasses(): Promise<ClassSession[]> {
    return Array.from(this.sessions.values());
  }

  async seedDefaults(): Promise<void> {
    return;
  }
}

class InMemoryEnrollmentRepo implements EnrollmentRepository {
  constructor(private enrollments: Enrollment[], private waitlistUpdates: Enrollment[] = []) {}

  async countConfirmed(classId: number): Promise<number> {
    return this.enrollments.filter((e) => e.classId === classId && e.status === 'confirmed').length;
  }

  async listWaitlistByClass(classId: number, limit: number): Promise<Enrollment[]> {
    return this.enrollments
      .filter((e) => e.classId === classId && e.status === 'waitlist')
      .sort((a, b) => a.id - b.id)
      .slice(0, limit);
  }

  async updateStatus(enrollmentId: number, status: 'confirmed' | 'waitlist'): Promise<void> {
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId);
    if (enrollment) enrollment.status = status;
    this.waitlistUpdates.push({ ...(enrollment as Enrollment) });
  }

  async findByClassAndUser(): Promise<Enrollment | undefined> {
    return undefined;
  }

  async createEnrollment(): Promise<void> {
    return;
  }

  async deleteEnrollment(): Promise<void> {
    return;
  }

  async listByClass(): Promise<(Enrollment & { user: { id: number; name: string } })[]> {
    return [];
  }
}

const classSession: ClassSession = {
  id: 1,
  title: 'No-Gi',
  instructor: 'Coach',
  schedule: 'Lunes 20:00',
  capacity: 2,
};

const createEnrollments = (): Enrollment[] => [
  { id: 1, classId: 1, userId: 1, status: 'confirmed' },
  { id: 2, classId: 1, userId: 2, status: 'waitlist' },
  { id: 3, classId: 1, userId: 3, status: 'waitlist' },
];

const setup = () => {
  const classes = new InMemoryClassRepo([classSession]);
  const waitlistUpdates: Enrollment[] = [];
  const enrollments = createEnrollments();
  const enrollmentRepo = new InMemoryEnrollmentRepo(enrollments, waitlistUpdates);
  const waitlist = new WaitlistService(classes, enrollmentRepo);
  return { waitlist, enrollmentRepo, enrollments, waitlistUpdates };
};

describe('WaitlistService', () => {
  it('promueve a la lista de espera cuando hay huecos', async () => {
    const { waitlist, enrollments, waitlistUpdates } = setup();

    await waitlist.promoteIfCapacityAllows(1);

    expect(enrollments.find((e) => e.id === 2)?.status).toBe('confirmed');
    expect(waitlistUpdates.some((u) => u.id === 2 && u.status === 'confirmed')).toBe(true);
  });

  it('no cambia nada si no hay huecos', async () => {
    const classes = new InMemoryClassRepo([{ ...classSession, capacity: 1 }]);
    const waitlistUpdates: Enrollment[] = [];
    const enrollments = createEnrollments();
    const enrollmentRepo = new InMemoryEnrollmentRepo(enrollments, waitlistUpdates);
    const waitlist = new WaitlistService(classes, enrollmentRepo);

    await waitlist.promoteIfCapacityAllows(1);

    expect(enrollments.filter((e) => e.status === 'confirmed').length).toBe(1);
  });
});

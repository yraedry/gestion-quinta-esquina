import { ClassRepository, EnrollmentRepository } from '../../domain/repositories/class-repository.js';
import { WaitlistService } from '../services/waitlist-service.js';

export class EnrollInClass {
  constructor(
    private readonly classes: ClassRepository,
    private readonly enrollments: EnrollmentRepository,
    private readonly waitlist: WaitlistService
  ) {}

  async execute(classId: number, userId: number): Promise<'confirmed' | 'waitlist'> {
    const session = await this.classes.findById(classId);
    if (!session) throw new Error('Clase no encontrada');

    const existing = await this.enrollments.findByClassAndUser(classId, userId);
    if (existing) throw new Error('Ya estás apuntado o en espera');

    const confirmedCount = await this.enrollments.countConfirmed(classId);
    const status = confirmedCount < session.capacity ? 'confirmed' : 'waitlist';

    await this.enrollments.createEnrollment({ classId, userId, status, createdAt: new Date().toISOString() });
    if (status === 'confirmed') {
      await this.waitlist.promoteIfCapacityAllows(classId);
    }
    return status;
  }
}

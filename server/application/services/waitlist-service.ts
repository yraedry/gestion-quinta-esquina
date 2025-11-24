import { ClassRepository, EnrollmentRepository } from '../../domain/repositories/class-repository.js';

export class WaitlistService {
  constructor(private readonly classes: ClassRepository, private readonly enrollments: EnrollmentRepository) {}

  async promoteIfCapacityAllows(classId: number): Promise<void> {
    const session = await this.classes.findById(classId);
    if (!session) return;

    const confirmedCount = await this.enrollments.countConfirmed(classId);
    const openSlots = Math.max(0, session.capacity - confirmedCount);
    if (openSlots <= 0) return;

    const waitlist = await this.enrollments.listWaitlistByClass(classId, openSlots);
    await Promise.all(waitlist.map((entry) => this.enrollments.updateStatus(entry.id, 'confirmed')));
  }
}

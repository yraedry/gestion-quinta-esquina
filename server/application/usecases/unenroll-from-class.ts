import { EnrollmentRepository } from '../../domain/repositories/class-repository.js';
import { WaitlistService } from '../services/waitlist-service.js';

export class UnenrollFromClass {
  constructor(private readonly enrollments: EnrollmentRepository, private readonly waitlist: WaitlistService) {}

  async execute(classId: number, userId: number): Promise<void> {
    await this.enrollments.deleteEnrollment(classId, userId);
    await this.waitlist.promoteIfCapacityAllows(classId);
  }
}

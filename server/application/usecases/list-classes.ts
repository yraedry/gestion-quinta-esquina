import { ClassRepository, EnrollmentRepository } from '../../domain/repositories/class-repository.js';
import { ClassSession } from '../../domain/entities/class-session.js';

export interface ClassWithAttendees extends ClassSession {
  attendees: { id: number; name: string }[];
  waitlist: { id: number; name: string }[];
}

export class ListClasses {
  constructor(private readonly classes: ClassRepository, private readonly enrollments: EnrollmentRepository) {}

  async execute(): Promise<ClassWithAttendees[]> {
    const classes = await this.classes.listClasses();
    const enrollmentRows = await Promise.all(classes.map((cls) => this.enrollments.listByClass(cls.id)));

    return classes.map((cls, index) => {
      const entries = enrollmentRows[index];
      return {
        ...cls,
        attendees: entries
          .filter((e) => e.status === 'confirmed')
          .map((e) => ({ id: e.user.id, name: e.user.name })),
        waitlist: entries
          .filter((e) => e.status === 'waitlist')
          .map((e) => ({ id: e.user.id, name: e.user.name }))
      };
    });
  }
}

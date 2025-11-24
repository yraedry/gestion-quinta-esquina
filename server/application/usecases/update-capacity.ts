import { ClassRepository } from '../../domain/repositories/class-repository.js';
import { WaitlistService } from '../services/waitlist-service.js';

export class UpdateCapacity {
  constructor(private readonly classes: ClassRepository, private readonly waitlist: WaitlistService) {}

  async execute(classId: number, delta: number): Promise<number> {
    const session = await this.classes.findById(classId);
    if (!session) throw new Error('Clase no encontrada');

    const newCapacity = Math.max(1, session.capacity + delta);
    await this.classes.updateCapacity(classId, newCapacity);
    await this.waitlist.promoteIfCapacityAllows(classId);

    return newCapacity;
  }
}

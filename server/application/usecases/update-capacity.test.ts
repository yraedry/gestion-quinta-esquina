import { UpdateCapacity } from './update-capacity.js';
import { ClassRepository } from '../../domain/repositories/class-repository.js';
import { WaitlistService } from '../services/waitlist-service.js';
import { ClassSession } from '../../domain/entities/class-session.js';

class FakeWaitlistService extends WaitlistService {
  public promoted: number[] = [];
  constructor() {
    // @ts-expect-error intentionally bypassing interface requirements for the spy
    super({}, {});
  }

  async promoteIfCapacityAllows(classId: number): Promise<void> {
    this.promoted.push(classId);
  }
}

class InMemoryClassRepo implements ClassRepository {
  constructor(private sessions: ClassSession[]) {}

  async findById(id: number): Promise<ClassSession | undefined> {
    return this.sessions.find((s) => s.id === id);
  }

  async updateCapacity(id: number, capacity: number): Promise<void> {
    const session = this.sessions.find((s) => s.id === id);
    if (session) session.capacity = capacity;
  }

  async listClasses(): Promise<ClassSession[]> {
    return this.sessions;
  }

  async seedDefaults(): Promise<void> {
    return;
  }
}

describe('UpdateCapacity', () => {
  const initial: ClassSession = {
    id: 7,
    title: 'Gi',
    instructor: 'Sensei',
    schedule: 'Martes 19:00',
    capacity: 3,
  };

  it('ajusta capacidad respetando mínimo de 1', async () => {
    const repo = new InMemoryClassRepo([{ ...initial }]);
    const waitlist = new FakeWaitlistService();
    const usecase = new UpdateCapacity(repo, waitlist);

    const updated = await usecase.execute(7, -10);

    expect(updated).toBe(1);
    expect((await repo.findById(7))?.capacity).toBe(1);
    expect(waitlist.promoted).toContain(7);
  });

  it('lanza error si la clase no existe', async () => {
    const repo = new InMemoryClassRepo([]);
    const waitlist = new FakeWaitlistService();
    const usecase = new UpdateCapacity(repo, waitlist);

    await expect(usecase.execute(99, 1)).rejects.toThrow('Clase no encontrada');
  });
});

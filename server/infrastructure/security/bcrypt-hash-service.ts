import bcrypt from 'bcryptjs';
import { HashService } from '../../application/ports/hash-service.js';

export class BcryptHashService implements HashService {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  compare(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw, hashed);
  }
}

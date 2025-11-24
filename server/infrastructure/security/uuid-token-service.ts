import { v4 as uuid } from 'uuid';
import { TokenService } from '../../application/ports/token-service.js';

export class UuidTokenService implements TokenService {
  generate(): string {
    return uuid();
  }
}

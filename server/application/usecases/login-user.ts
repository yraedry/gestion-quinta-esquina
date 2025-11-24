import { HashService } from '../ports/hash-service.js';
import { TokenService } from '../ports/token-service.js';
import { UserRepository } from '../../domain/repositories/user-repository.js';
import { UserRole } from '../../domain/entities/user.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<{ id: number; name: string; email: string; role: UserRole; token: string }>
  {
    const { email, password } = input;
    const user = await this.users.findByEmail(email);
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await this.hashService.compare(password, user.password);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = this.tokenService.generate();
    await this.users.updateSessionToken(user.id, token);

    return { id: user.id, name: user.name, email: user.email, role: user.role, token };
  }
}

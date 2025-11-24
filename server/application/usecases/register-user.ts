import { HashService } from '../ports/hash-service.js';
import { TokenService } from '../ports/token-service.js';
import { InviteRepository, UserRepository } from '../../domain/repositories/user-repository.js';
import { UserRole } from '../../domain/entities/user.js';

export interface RegisterUserInput {
  inviteToken: string;
  name: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly users: UserRepository,
    private readonly invites: InviteRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<{ id: number; name: string; email: string; role: UserRole; token: string }>
  {
    const { inviteToken, name, email, password } = input;
    const invite = await this.invites.findValidInvite(inviteToken);
    if (!invite) throw new Error('Invitación no válida');

    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error('Ya existe un usuario con ese correo');

    const hashed = await this.hashService.hash(password);
    const role: UserRole = invite.role;

    const created = await this.users.create({ name, email, password: hashed, role, sessionToken: null });
    await this.invites.markUsed(inviteToken);

    const sessionToken = this.tokenService.generate();
    await this.users.updateSessionToken(created.id, sessionToken);

    return { id: created.id, name, email, role, token: sessionToken };
  }
}

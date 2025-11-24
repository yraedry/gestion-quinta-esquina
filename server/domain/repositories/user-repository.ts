import { Invite, User } from '../entities/user.js';

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findBySessionToken(token: string): Promise<User | undefined>;
  create(user: Omit<User, 'id'>): Promise<User>;
  updateSessionToken(userId: number, token: string): Promise<void>;
}

export interface InviteRepository {
  findValidInvite(token: string): Promise<Invite | undefined>;
  markUsed(token: string): Promise<void>;
  seedAdminInvite(): Promise<void>;
}

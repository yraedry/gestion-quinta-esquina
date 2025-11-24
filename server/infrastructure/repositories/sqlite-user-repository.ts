import { getDb } from '../db/sqlite-connection.js';
import { Invite, User } from '../../domain/entities/user.js';
import { InviteRepository, UserRepository } from '../../domain/repositories/user-repository.js';

export class SqliteUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    const db = await getDb();
    const row = await db.get<User>(`SELECT * FROM users WHERE email = ?`, email);
    return row || undefined;
  }

  async findBySessionToken(token: string): Promise<User | undefined> {
    const db = await getDb();
    const row = await db.get<User>(`SELECT * FROM users WHERE sessionToken = ?`, token);
    return row || undefined;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO users (name, email, password, role, sessionToken) VALUES (?, ?, ?, ?, ?)`,
      user.name,
      user.email,
      user.password,
      user.role,
      user.sessionToken
    );
    return { ...user, id: result.lastID! };
  }

  async updateSessionToken(userId: number, token: string): Promise<void> {
    const db = await getDb();
    await db.run(`UPDATE users SET sessionToken = ? WHERE id = ?`, token, userId);
  }
}

export class SqliteInviteRepository implements InviteRepository {
  async findValidInvite(token: string): Promise<Invite | undefined> {
    const db = await getDb();
    const invite = await db.get<Invite>(`SELECT * FROM invites WHERE token = ? AND used = 0`, token);
    return invite || undefined;
  }

  async markUsed(token: string): Promise<void> {
    const db = await getDb();
    await db.run(`UPDATE invites SET used = 1 WHERE token = ?`, token);
  }

  async seedAdminInvite(): Promise<void> {
    const db = await getDb();
    await db.run(
      `INSERT OR IGNORE INTO invites (token, email, role, used, createdAt) VALUES (?, ?, 'admin', 0, ?)`,
      'ADMIN-INVITE-001',
      'admin@dojo.com',
      new Date().toISOString()
    );
  }
}

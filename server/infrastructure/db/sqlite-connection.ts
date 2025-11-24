import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { HashService } from '../../application/ports/hash-service.js';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function getDb() {
  if (!db) {
    db = await open({ filename: './data/app.db', driver: sqlite3.Database });
  }
  return db;
}

export async function initSchema(hashService: HashService) {
  const database = await getDb();
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'alumno',
      sessionToken TEXT
    );

    CREATE TABLE IF NOT EXISTS invites (
      token TEXT PRIMARY KEY,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'alumno',
      used INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      instructor TEXT NOT NULL,
      capacity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('confirmed', 'waitlist')),
      createdAt TEXT NOT NULL,
      UNIQUE(classId, userId),
      FOREIGN KEY(classId) REFERENCES classes(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  await seed(database, hashService);
}

async function seed(database: Database, hashService: HashService) {
  const adminInvite = 'ADMIN-INVITE-001';
  await database.run(
    `INSERT OR IGNORE INTO invites (token, email, role, used, createdAt) VALUES (?, ?, 'admin', 0, ?)`,
    adminInvite,
    'admin@dojo.com',
    new Date().toISOString()
  );

  const adminExists = await database.get(`SELECT id FROM users WHERE email = ?`, 'admin@dojo.com');
  if (!adminExists) {
    const password = await hashService.hash('admin123');
    await database.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`,
      'Admin',
      'admin@dojo.com',
      password
    );
  }

  const classCount = await database.get<{ count: number }>(`SELECT COUNT(*) as count FROM classes`);
  if (!classCount?.count) {
    const now = new Date();
    const baseDate = (offset: number) => new Date(now.getTime() + offset * 24 * 60 * 60 * 1000).toISOString();
    await database.run(
      `INSERT INTO classes (title, date, instructor, capacity) VALUES (?, ?, ?, ?)`,
      'Clase gi avanzado',
      baseDate(1),
      'Coach Ana',
      12
    );
    await database.run(
      `INSERT INTO classes (title, date, instructor, capacity) VALUES (?, ?, ?, ?)`,
      'Fundamentos NoGi',
      baseDate(2),
      'Coach Luis',
      16
    );
  }
}

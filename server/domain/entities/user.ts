export type UserRole = 'admin' | 'alumno';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  sessionToken?: string | null;
}

export interface Invite {
  token: string;
  email: string | null;
  role: UserRole;
  used: number;
  createdAt: string;
}

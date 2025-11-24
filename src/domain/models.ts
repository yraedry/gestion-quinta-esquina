export type UserRole = 'admin' | 'alumno';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface Attendee {
  id: number;
  name: string;
}

export interface ClassSession {
  id: number;
  title: string;
  date: string;
  instructor: string;
  capacity: number;
  attendees: Attendee[];
  waitlist: Attendee[];
}

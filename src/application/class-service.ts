import { ClassSession } from '../domain/models.js';
import { apiRequest } from '../infrastructure/http/api-client.js';

export async function fetchClasses(token?: string): Promise<ClassSession[]> {
  return apiRequest<ClassSession[]>('/api/classes', { token });
}

export async function enrollInClass(classId: number, token: string) {
  return apiRequest<{ status: 'confirmed' | 'waitlist' }>(`/api/classes/${classId}/enroll`, {
    method: 'POST',
    token
  });
}

export async function unenrollFromClass(classId: number, token: string) {
  return apiRequest(`/api/classes/${classId}/unenroll`, {
    method: 'POST',
    token
  });
}

export async function updateCapacity(classId: number, delta: number, token: string) {
  return apiRequest<{ capacity: number }>(`/api/classes/${classId}/capacity`, {
    method: 'POST',
    token,
    body: JSON.stringify({ delta })
  });
}

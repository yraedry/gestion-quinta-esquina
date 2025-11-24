import { User } from '../domain/models.js';
import { apiRequest } from '../infrastructure/http/api-client.js';

export async function login(email: string, password: string): Promise<User> {
  return apiRequest<User>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function register(inviteToken: string, name: string, email: string, password: string): Promise<User> {
  return apiRequest<User>('/api/register', {
    method: 'POST',
    body: JSON.stringify({ inviteToken, name, email, password })
  });
}

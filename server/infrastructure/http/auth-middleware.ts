import express from 'express';
import { UserRepository } from '../../domain/repositories/user-repository.js';
import { UserRole } from '../../domain/entities/user.js';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  sessionToken: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthenticatedUser;
    }
  }
}

export function attachCurrentUser(userRepository: UserRepository): express.RequestHandler {
  return async (req, _res, next) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.substring('Bearer '.length);
      const user = await userRepository.findBySessionToken(token);
      if (user) {
        req.currentUser = { id: user.id, name: user.name, email: user.email, role: user.role, sessionToken: token };
      }
    }
    next();
  };
}

export function ensureAuth(_req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!_req.currentUser) {
    return res.status(401).json({ message: 'Requiere autenticación' });
  }
  next();
}

export function ensureAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.currentUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Solo administradores' });
  }
  next();
}

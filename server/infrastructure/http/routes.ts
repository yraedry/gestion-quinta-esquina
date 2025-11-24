import express from 'express';
import { RegisterUser } from '../../application/usecases/register-user.js';
import { LoginUser } from '../../application/usecases/login-user.js';
import { ListClasses } from '../../application/usecases/list-classes.js';
import { EnrollInClass } from '../../application/usecases/enroll-in-class.js';
import { UnenrollFromClass } from '../../application/usecases/unenroll-from-class.js';
import { UpdateCapacity } from '../../application/usecases/update-capacity.js';
import { ensureAdmin, ensureAuth } from './auth-middleware.js';

export function buildRoutes(deps: {
  registerUser: RegisterUser;
  loginUser: LoginUser;
  listClasses: ListClasses;
  enrollInClass: EnrollInClass;
  unenrollFromClass: UnenrollFromClass;
  updateCapacity: UpdateCapacity;
}) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const result = await deps.registerUser.execute(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo registrar' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const result = await deps.loginUser.execute(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error instanceof Error ? error.message : 'Credenciales inválidas' });
    }
  });

  router.get('/classes', async (_req, res) => {
    const classes = await deps.listClasses.execute();
    res.json(classes);
  });

  router.post('/classes/:id/enroll', ensureAuth, async (req, res) => {
    try {
      const status = await deps.enrollInClass.execute(Number(req.params.id), req.currentUser!.id);
      res.json({ status });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo apuntar' });
    }
  });

  router.post('/classes/:id/unenroll', ensureAuth, async (req, res) => {
    await deps.unenrollFromClass.execute(Number(req.params.id), req.currentUser!.id);
    res.json({ message: 'Plaza liberada' });
  });

  router.post('/classes/:id/capacity', ensureAuth, ensureAdmin, async (req, res) => {
    try {
      const capacity = await deps.updateCapacity.execute(Number(req.params.id), Number(req.body?.delta ?? 0));
      res.json({ capacity });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'No se pudo actualizar capacidad' });
    }
  });

  return router;
}

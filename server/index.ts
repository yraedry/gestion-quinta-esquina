import express from 'express';
import cors from 'cors';
import { BcryptHashService } from './infrastructure/security/bcrypt-hash-service.js';
import { UuidTokenService } from './infrastructure/security/uuid-token-service.js';
import { SqliteUserRepository, SqliteInviteRepository } from './infrastructure/repositories/sqlite-user-repository.js';
import { SqliteClassRepository, SqliteEnrollmentRepository } from './infrastructure/repositories/sqlite-class-repository.js';
import { initSchema } from './infrastructure/db/sqlite-connection.js';
import { attachCurrentUser } from './infrastructure/http/auth-middleware.js';
import { RegisterUser } from './application/usecases/register-user.js';
import { LoginUser } from './application/usecases/login-user.js';
import { ListClasses } from './application/usecases/list-classes.js';
import { EnrollInClass } from './application/usecases/enroll-in-class.js';
import { UnenrollFromClass } from './application/usecases/unenroll-from-class.js';
import { UpdateCapacity } from './application/usecases/update-capacity.js';
import { WaitlistService } from './application/services/waitlist-service.js';
import { buildRoutes } from './infrastructure/http/routes.js';

const app = express();
app.use(cors());
app.use(express.json());

const hashService = new BcryptHashService();
const tokenService = new UuidTokenService();
const userRepository = new SqliteUserRepository();
const inviteRepository = new SqliteInviteRepository();
const classRepository = new SqliteClassRepository();
const enrollmentRepository = new SqliteEnrollmentRepository();
const waitlistService = new WaitlistService(classRepository, enrollmentRepository);

app.use(attachCurrentUser(userRepository));

const routes = buildRoutes({
  registerUser: new RegisterUser(userRepository, inviteRepository, hashService, tokenService),
  loginUser: new LoginUser(userRepository, hashService, tokenService),
  listClasses: new ListClasses(classRepository, enrollmentRepository),
  enrollInClass: new EnrollInClass(classRepository, enrollmentRepository, waitlistService),
  unenrollFromClass: new UnenrollFromClass(enrollmentRepository, waitlistService),
  updateCapacity: new UpdateCapacity(classRepository, waitlistService)
});

app.use('/api', routes);

const PORT = process.env.PORT || 5174;

initSchema(hashService).then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
});

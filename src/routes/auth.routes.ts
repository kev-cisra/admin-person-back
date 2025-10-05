import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/register', AuthController.registerPersonal);
authRouter.patch('/password', AuthController.updatePassword);
authRouter.patch('/email', AuthController.updateEmail);

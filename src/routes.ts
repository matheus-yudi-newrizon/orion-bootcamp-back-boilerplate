import { Router } from 'express';
import { Container } from 'typedi';
import { UserController } from './controller/UserController';

const router = Router();

const userController: UserController = Container.get(UserController);

router.get('/ping', (_req, res) => res.send('pong'));

router.post('/signup', (req, res) => userController.signup(req, res));

export default router;

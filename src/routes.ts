import { Router } from 'express';
import { UserController } from './controller/UserController';

const router = Router();

router.post('/signup', UserController.signup);

router.get('/ping', (_req, res) => res.send('pong'));

export default router;



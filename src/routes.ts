import { Router } from 'express';
import { UserController } from './controller/UserController'

const router = Router();


router.get('/signup', new UserController().signup);

router.post('/signup', new UserController().signup);

// Route for ping/pong testing
router.get('/ping', (_req, res) => res.send('pong'));

export default router;

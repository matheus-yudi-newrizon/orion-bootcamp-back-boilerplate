import { Router } from 'express';
import { UserController } from './controller/UserController'

const router = Router();


router.get('/signup', new UserController().signup);

router.post('/signup', new UserController().signup);

export default router;

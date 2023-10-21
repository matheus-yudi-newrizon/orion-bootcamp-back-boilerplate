import { Router } from 'express';
import { HomeController } from './controller/HomeController';
import UserController from 'controller/UserController';

const router = Router();

router.get('/', new HomeController().hello);

router.get('/user/signup', new UserController().signup);

export default router;

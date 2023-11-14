import { Router } from 'express';
import { Container } from 'typedi';
import { AuthController } from './controller/AuthController';

const router = Router();

const authController: AuthController = Container.get(AuthController);

router.get('/ping', (_req, res) => res.send('pong'));

router.post('/auth/signup', (req, res) => authController.signup(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/auth/forgot-password', (req, res) => authController.forgotPassword(req, res));

export default router;

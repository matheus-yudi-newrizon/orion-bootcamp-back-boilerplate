import { Router } from 'express';
import { Container } from 'typedi';
import { AuthController } from './controller/AuthController';
import { GameController } from './controller/GameController';
import { ReviewController } from './controller/ReviewController';
import { validateJwt } from './middleware/ValidateJwt';

const router = Router();

const authController: AuthController = Container.get(AuthController);
const gameController: GameController = Container.get(GameController);
const reviewController: ReviewController = Container.get(ReviewController);

router.get('/ping', (_req, res) => res.send('pong'));

router.post('/auth/signup', (req, res) => authController.signup(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/auth/forgot-password', (req, res) => authController.forgotPassword(req, res));

router.post('/games/new', validateJwt, (req, res) => gameController.newGame(req, res));

router.get('/reviews/random', validateJwt, (req, res) => reviewController.getReview(req, res));

export default router;

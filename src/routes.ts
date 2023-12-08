import { Router } from 'express';
import { Container } from 'typedi';
import { AuthController, GameController, MovieController, ReviewController } from './controller';
import { validateJwt, validateQuery } from './middleware';

const router = Router();

const authController: AuthController = Container.get(AuthController);
const gameController: GameController = Container.get(GameController);
const reviewController: ReviewController = Container.get(ReviewController);
const movieController: MovieController = Container.get(MovieController);

router.get('/ping', (_req, res) => res.send('pong'));

router.post('/auth/signup', (req, res) => authController.signup(req, res));
router.put('/auth/confirm-email', (req, res) => authController.confirmEmail(req, res));
router.post('/auth/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.put('/auth/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/refresh-token', (req, res) => authController.refreshToken(req, res));

router.get('/movies', validateQuery(['title']), validateJwt, (req, res) => movieController.searchMovies(req, res));
router.post('/movies/answer', validateJwt, (req, res) => movieController.getMovieByReview(req, res));

router.post('/games/new', validateJwt, (req, res) => gameController.newGame(req, res));
router.put('/games/answer', validateJwt, (req, res) => gameController.sendAnswer(req, res));

router.get('/reviews/random', validateJwt, (req, res) => reviewController.getReview(req, res));

export default router;

import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { Container } from 'typedi';
import { GameResponseDTO } from '../../src/dto';
import { DatabaseOperationFailException, EmailNotValidException, EntityNotFoundException, GameIsActiveException } from '../../src/exception';
import { ICustomRequest, IGameAnswerRequest } from '../../src/interface';
import * as middleware from '../../src/middleware';
import routes from '../../src/routes';
import { GameService } from '../../src/service';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';
import { Generate } from '../mocks/Generate';

const app = express();
app.use(express.json());
app.use(routes);

const gameService = Container.get(GameService);

const generate = new Generate();

jest.mock('../../src/middleware/ValidateJwt');

describe('GameController', () => {
  describe('POST /games/new', () => {
    it('should return 201 and a new game created', async () => {
      const gameResponse: GameResponseDTO = generate.gameResponse();
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValue();
      const spyCreateGame = jest.spyOn(gameService, 'createGame').mockResolvedValue(gameResponse);

      const response = await request(app).post('/games/new').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyCreateGame).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and EmailNotValidException', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementation(() => {
        throw new EmailNotValidException();
      });

      const response = await request(app).post('/games/new').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and GameIsActiveException', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValue();
      const spyCreateGame = jest.spyOn(gameService, 'createGame').mockImplementation(() => {
        throw new GameIsActiveException();
      });

      const response = await request(app).post('/games/new').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyCreateGame).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValue();
      const spyCreateGame = jest.spyOn(gameService, 'createGame').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/games/new').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyCreateGame).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /games/answer', () => {
    it('should return 201 and the updated game data', async () => {
      const user = generate.userPayload();
      const jwt: string = generate.encodedJwt();
      const gameAnswer: IGameAnswerRequest = generate.gameAnswerRequest();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spySendAnswer = jest.spyOn(gameService, 'sendAnswer').mockResolvedValue(generate.gameReviewResponse());

      const response = await request(app).put('/games/answer').set('Authorization', `Bearer ${jwt}`).send(gameAnswer);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySendAnswer).toHaveBeenCalledWith(gameAnswer, user.id);
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and RequiredFieldException for reviewId', async () => {
      const user = generate.userPayload();
      const jwt: string = generate.encodedJwt();
      const gameAnswer: IGameAnswerRequest = generate.gameAnswerRequest();
      gameAnswer.reviewId = undefined;

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });

      const response = await request(app).put('/games/answer').set('Authorization', `Bearer ${jwt}`).send(gameAnswer);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for answer', async () => {
      const user = generate.userPayload();
      const jwt: string = generate.encodedJwt();
      const gameAnswer: IGameAnswerRequest = generate.gameAnswerRequest();
      gameAnswer.answer = undefined;

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });

      const response = await request(app).put('/games/answer').set('Authorization', `Bearer ${jwt}`).send(gameAnswer);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EntityNotFoundException', async () => {
      const user = generate.userPayload();
      const jwt: string = generate.encodedJwt();
      const gameAnswer: IGameAnswerRequest = generate.gameAnswerRequest();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spySendAnswer = jest.spyOn(gameService, 'sendAnswer').mockImplementation(() => {
        throw new EntityNotFoundException('game');
      });

      const response = await request(app).put('/games/answer').set('Authorization', `Bearer ${jwt}`).send(gameAnswer);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySendAnswer).toHaveBeenCalledWith(gameAnswer, user.id);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const user = generate.userPayload();
      const jwt: string = generate.encodedJwt();
      const gameAnswer: IGameAnswerRequest = generate.gameAnswerRequest();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spySendAnswer = jest.spyOn(gameService, 'sendAnswer').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).put('/games/answer').set('Authorization', `Bearer ${jwt}`).send(gameAnswer);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySendAnswer).toHaveBeenCalledWith(gameAnswer, user.id);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

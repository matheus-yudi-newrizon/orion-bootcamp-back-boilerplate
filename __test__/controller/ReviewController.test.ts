import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { Container } from 'typedi';
import { ReviewDTO } from '../../src/dto';
import { DatabaseOperationFailException, EmailNotValidException } from '../../src/exception';
import { ICustomRequest } from '../../src/interface';
import * as middleware from '../../src/middleware';
import routes from '../../src/routes';
import { ReviewService } from '../../src/service';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';
import { Generate } from '../mocks/Generate';

const app = express();
app.use(express.json());
app.use(routes);

const reviewService = Container.get(ReviewService);

const generate = new Generate();

jest.mock('../../src/middleware/ValidateJwt');

describe('ReviewController', () => {
  describe('GET /reviews/random', () => {
    it('should return 200 and a random review', async () => {
      const reviewResponse: ReviewDTO = generate.reviewResponse(); // getReviewResponse
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValue();
      const spyGetReview = jest.spyOn(reviewService, 'getReview').mockResolvedValue(reviewResponse);

      const response = await request(app).get('/reviews/random').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyGetReview).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(200);
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

      const response = await request(app).get('/reviews/random').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
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
      const spyGetReview = jest.spyOn(reviewService, 'getReview').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).get('/reviews/random').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyGetReview).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and any Error', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValue();
      const spyGetReview = jest.spyOn(reviewService, 'getReview').mockImplementation(() => {
        throw new Error();
      });

      const response = await request(app).get('/reviews/random').set('Authorization', `Bearer ${jwt}`);

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyGetReview).toHaveBeenCalledWith(user.id);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

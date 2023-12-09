import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { Container } from 'typedi';
import { MovieDTO, ReviewDTO } from '../../src/dto';
import { DatabaseOperationFailException, EmailNotValidException } from '../../src/exception';
import { ICustomRequest } from '../../src/interface';
import * as middleware from '../../src/middleware';
import routes from '../../src/routes';
import { MovieService } from '../../src/service';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';
import { Generate } from '../mocks/Generate';
import { Movie } from '../../src/entity';

const app = express();
app.use(express.json());
app.use(routes);

const movieService = Container.get(MovieService);

const generate = new Generate();

jest.mock('../../src/middleware/ValidateJwt');

describe('MovieController', () => {
  describe('GET /movies', () => {
    it('should return 200 and a list of movies', async () => {
      const expectedMovies: MovieDTO[] = [];

      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();
      const title = 'Pira';

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spySearchMovies = jest.spyOn(movieService, 'searchMoviesByTitle').mockResolvedValue(expectedMovies);

      const response = await request(app).get('/movies').set('Authorization', `Bearer ${jwt}`).query({ title });

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySearchMovies).toHaveBeenCalledWith(user.id, title);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();
      const title = 'Pirates';

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });
      const spySearchMovies = jest.spyOn(movieService, 'searchMoviesByTitle').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).get('/movies').set('Authorization', `Bearer ${jwt}`).query({ title });

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySearchMovies).toHaveBeenCalledWith(user.id, title);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and any Error', async () => {
      const jwt: string = generate.encodedJwt();
      const user = generate.userPayload();
      const title = 'Pirates';

      const spyValidateJwt = jest.spyOn(middleware, 'validateJwt').mockImplementation((req: Request, _res: Response, next: NextFunction) => {
        (req as ICustomRequest).token = user;
        return next();
      });

      const spySearchMovies = jest.spyOn(movieService, 'searchMoviesByTitle').mockImplementation(() => {
        throw new Error();
      });

      const response = await request(app).get('/movies').set('Authorization', `Bearer ${jwt}`).query({ title });

      expect(spyValidateJwt).toHaveBeenCalled();
      expect(spySearchMovies).toHaveBeenCalledWith(user.id, title);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

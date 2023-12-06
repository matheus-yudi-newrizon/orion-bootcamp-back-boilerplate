import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { MovieDTO } from '../dto';
import { BusinessException, InsufficientLengthException } from '../exception';
import { IControllerResponse, ICustomRequest } from '../interface';
import { MovieService } from '../service';

@Controller()
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /**
   * @swagger
   * /movies:
   *   get:
   *     tags:
   *       - movies
   *     summary: Get movies by title
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: title
   *         schema:
   *           type: string
   *           description: The title of the movie to query
   *     responses:
   *       '200':
   *         description: Return an array of movies found in the database
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Found movies successfully.'
   *               data:
   *                 - title: 'Pirates of the Caribbean: The Curse of the Black Pearl'
   *                   posterPath: '/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg'
   *                   releaseDate: '2003-07-09'
   *                   id: 22
   *                 - title: 'Pirates of the Caribbean: Dead Men Tell No Tales'
   *                   posterPath: '/qwoGfcg6YUS55nUweKGujHE54Wy.jpg'
   *                   releaseDate: '2017-05-23'
   *                   id: 166426
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               InvalidQueryException:
   *                 value:
   *                   success: false
   *                   message: 'InvalidQueryException. The query string is missing query parameters.'
   *               EntityNotFoundException:
   *                 value:
   *                   success: false
   *                   message: 'EntityNotFoundException. The user was not found in database.'
   *       '401':
   *         description: Return a JWT error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'JsonWebTokenError. Invalid token.'
   *       '500':
   *         description: Return a database exception or error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'DatabaseOperationFailException. Unsuccessful database operation.'
   */
  public async searchMovies(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;
      const title: string = req.query['title'] as string;

      if (title.length < 4) throw new InsufficientLengthException('title', 4);

      const movies: MovieDTO[] = await this.movieService.searchMoviesByTitle(jwtPayload.id, title);
      const result: IControllerResponse<MovieDTO[]> = {
        success: true,
        message: 'Found movies successfully.',
        data: movies
      };

      res.status(200).json(result);
    } catch (error) {
      const result: IControllerResponse<void> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }

  public async getMovieByReview(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;
      const review: string = req.body?.review;

      if (!review) {
        throw new InsufficientLengthException('review', 1);
      }

      const movie: MovieDTO = await this.movieService.getMovieByReview(review);
      const result: IControllerResponse<MovieDTO> = {
        success: true,
        message: 'Found movie by review successfully.',
        data: movie
      };

      res.status(200).json(result);
    } catch (error) {
      const result: IControllerResponse<void> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }
}

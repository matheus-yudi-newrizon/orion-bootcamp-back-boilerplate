import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { MovieDTO } from '../dto/MovieDTO';
import { BusinessException } from '../exception';
import { InsufficientLengthException } from '../exception/InsufficientLengthException';
import { IControllerResponse } from '../interface/IControllerResponse';
import { ICustomRequest } from '../interface/ICustomRequest';
import { MovieService } from '../service/MovieService';

@Controller()
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /**
   * @swagger
   * /movies:
   *   get:
   *     summary: Get movies by title.
   *     tags: [Get Movies]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
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
   *         description: Returns an array of movies found in the database.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       title:
   *                         type: string
   *                       posterPath:
   *                         type: string
   *                       releaseDate:
   *                         type: string
   *               example:
   *                 success: true
   *                 message: 'Found movies successfully.'
   *                 data:
   *                   - title: 'Pirates of the Caribbean: The Curse of the Black Pearl'
   *                     posterPath: '/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg'
   *                     releaseDate: '2003-07-09'
   *                   - title: 'Pirates of the Caribbean: Dead Men Tell No Tales'
   *                     posterPath: '/qwoGfcg6YUS55nUweKGujHE54Wy.jpg'
   *                     releaseDate: '2017-05-23'
   *       '400':
   *         description: Returns EntityNotFoundException.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *               example:
   *                 success: false
   *                 message: 'EntityNotFoundException. The movie was not found in database.'
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
}

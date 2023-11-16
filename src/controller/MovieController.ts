import { Request, Response } from 'express';
import { Service as Controller } from 'typedi';
import { MovieDTO } from '../dto/MovieDTO';
import { BusinessException, RequiredFieldException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { MovieService } from '../service/MovieService';

@Controller()
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /**
   * @swagger
   * /movies/title:
   *   get:
   *     summary: get movies by title.
   *     tags: [Get Movies]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *             example:
   *               title: Harry Potter
   *     responses:
   *       '200':
   *         description: Returns a array of movies found in the database.
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
   *                   type: object
   *                   properties:
   *                     title:
   *                       type: string
   *                     posterPath:
   *                       type: string
   *                     releaseDate:
   *                       type: date
   *               example:
   *                 success: true
   *                 message: 'Found film successfully'
   *                 data:
   *                   title: 'Harry Potter and the Chamber of Secrets'
   *                   posterPath: /sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg
   *                   releaseDate: 2002-11-13
   *       '400':
   *         description: Returns MovieNotFoundException.
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
   *                 message: 'MovieNotFoundException. Movie not found.'
   */
  public async searchMovies(req: Request, res: Response): Promise<void> {
    try {
      const { title } = req.body;

      if (!title) throw new RequiredFieldException('title');

      const movies: MovieDTO[] = await this.movieService.searchMoviesByTitle(title);
      const result: IControllerResponse<MovieDTO[]> = {
        success: true,
        message: 'Found film successfully',
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

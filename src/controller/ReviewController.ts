import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { ReviewDTO } from '../dto/ReviewDTO';
import { BusinessException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { ICustomRequest } from '../interface/ICustomRequest';
import { ReviewService } from '../service/ReviewService';
import { UserRequestValidator } from '../validation/UserRequestValidator';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * @swagger
   * /reviews/random:
   *   get:
   *     summary: Gets a random review.
   *     tags: [Random review]
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns a random review for the game.
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
   *                     id:
   *                       type: integer
   *                     title:
   *                       type: string
   *                     text:
   *                       type: string
   *               example:
   *                 success: true
   *                 message: 'Review generated successfully.'
   *                 data:
   *                   id: 1
   *                   title: "Ahh, the magic begins."
   *                   text: "Harry Potter is an Orphan who on his eleventh birthday discovers he's a wizard and is called to term at Hogwarts School. But Harry is soon to find out that his past, and his destiny, is a truly remarkable, magical, and terrifying thing.\r\n\r\nHarry Potter And The Philosopher's Stone arrived in a blaze of publicity, one of the most hyped and talked about motion pictures of the decade had finally arrived."
   *       '400':
   *         description: Returns UserNotFoundException.
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
   *                 message: 'UserNotFoundException. The user was not found in database.'
   */
  public async getReview(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;

      UserRequestValidator.validateUserEmail(jwtPayload.email);

      const reviewResponse: ReviewDTO = await this.reviewService.getReview(jwtPayload.id);
      const result: IControllerResponse<ReviewDTO> = {
        success: true,
        message: 'Review generated successfully.',
        data: reviewResponse
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

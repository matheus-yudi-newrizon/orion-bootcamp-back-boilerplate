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
   *     tags:
   *       - reviews
   *     summary: Get a random review
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Return a random review not loaded before in the game
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Review generated successfully.'
   *               data:
   *                 id: 5d38ee43b1f68d0012c2abea
   *                 text: "Ahh, the magic begins.\r\n\r\nHarry Potter is an Orphan who on his eleventh birthday discovers he's a wizard and is called to term at Hogwarts School. But Harry is soon to find out that his past, and his destiny, is a truly remarkable, magical, and terrifying thing.\r\n\r\nHarry Potter And The Philosopher's Stone arrived in a blaze of publicity, one of the most hyped and talked about motion pictures of the decade had finally arrived."
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               EmailNotValidException:
   *                 value:
   *                   success: false
   *                   message: 'EmailNotValidException. The email is not a valid email address.'
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
   *               message: 'JsonWebTokenError. invalid token.'
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

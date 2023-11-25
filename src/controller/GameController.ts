import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { GameResponseDTO } from '../dto/GameResponseDTO';
import { GameReviewResponseDTO } from '../dto/GameReviewResponseDTO';
import { BusinessException, RequiredFieldException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { ICustomRequest } from '../interface/ICustomRequest';
import { IGameAnswerRequest } from '../interface/IGameAnswerRequest';
import { GameService } from '../service/GameService';
import { UserRequestValidator } from '../validation/UserRequestValidator';

@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  /**
   * @swagger
   * /games/new:
   *   post:
   *     tags:
   *       - games
   *     summary: Create a new game
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '201':
   *         description: Return a new game created in the database
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Game created successfully.'
   *               data:
   *                 lives: 2
   *                 record: 40
   *                 combo: 0
   *                 isActive: true
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               EntityNotFoundException:
   *                 value:
   *                   success: false
   *                   message: 'EntityNotFoundException. The user was not found in database.'
   *               GameIsActiveException:
   *                 value:
   *                   success: false
   *                   message: 'GameIsActiveException. Cannot create a new game if there is one active.'
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
  public async newGame(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;

      UserRequestValidator.validateUserEmail(jwtPayload.email);

      const gameResponse: GameResponseDTO = await this.gameService.createGame(jwtPayload.id);
      const result: IControllerResponse<GameResponseDTO> = {
        success: true,
        message: 'Game created successfully.',
        data: gameResponse
      };

      res.status(201).json(result);
    } catch (error) {
      const result: IControllerResponse<void> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }

  /**
   * @swagger
   * /games/answer:
   *   put:
   *     tags:
   *       - games
   *     summary: Check the answer and return the updated game data
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SendAnswerRequest'
   *       required: true
   *     responses:
   *       '201':
   *         description: Send the result of the answer and the updated game data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Answer computed successfully.'
   *               data:
   *                 isCorrect: true
   *                 game:
   *                   lives: 2
   *                   record: 34
   *                   combo: 18
   *                   isActive: true
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               RequiredFieldException:
   *                 value:
   *                   success: false
   *                   message: 'RequiredFieldException. Required field: answer.'
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
  public async sendAnswer(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;
      const { reviewId, answer } = req.body;
      const gameAnswerRequest: IGameAnswerRequest = { reviewId, answer };

      if (!gameAnswerRequest.reviewId) throw new RequiredFieldException('reviewId');
      if (!gameAnswerRequest.answer) throw new RequiredFieldException('answer');

      const gameReviewResponse: GameReviewResponseDTO = await this.gameService.sendAnswer(gameAnswerRequest, jwtPayload.id);
      const result: IControllerResponse<GameReviewResponseDTO> = {
        success: true,
        message: 'Answer computed successfully.',
        data: gameReviewResponse
      };

      res.status(201).json(result);
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

import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { GameResponseDTO } from '../dto/GameResponseDTO';
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
   *     summary: Register a new game.
   *     tags: [New game]
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns a new game created in the database.
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
   *                     lives:
   *                       type: integer
   *                     score:
   *                       type: integer
   *                     combo:
   *                       type: integer
   *                     isActive:
   *                       type: boolean
   *               example:
   *                 success: true
   *                 message: 'Game created successfully.'
   *                 data:
   *                   id: 1
   *                   lives: 5
   *                   score: 0
   *                   combo: 0
   *                   isActive: true
   *       '400':
   *         description: Returns GameIsActiveException.
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
   *                 message: 'GameIsActiveException. Cannot create a new game if there is one active.'
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
   *     summary: Receives the game data after checking the answer.
   *     tags: [Game answer]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reviewId:
   *                 type: integer
   *               answer:
   *                 type: string
   *             example:
   *               reviewId: 11
   *               answer: 'Harry Potter and the Magic Wizard'
   *     responses:
   *       '201':
   *         description: Sends the game data if the answer was computed.
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
   *                     lives:
   *                       type: integer
   *                     score:
   *                       type: integer
   *                     combo:
   *                       type: integer
   *                     isActive:
   *                       type: boolean
   *               example:
   *                 success: true
   *                 message: 'Answer computed successfully.'
   *                 data:
   *                   lives: 2
   *                   score: 4
   *                   combo: 8
   *                   isActive: true
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
   *                 message: 'EntityNotFoundException. The user was not found in database.'
   */
  public async sendAnswer(req: Request, res: Response): Promise<void> {
    try {
      const jwtPayload: JwtPayload = (req as ICustomRequest).token;
      const { reviewId, answer } = req.body;
      const gameAnswerRequest: IGameAnswerRequest = { reviewId, answer };

      if (!gameAnswerRequest.reviewId) throw new RequiredFieldException('reviewId');
      if (!gameAnswerRequest.answer) throw new RequiredFieldException('answer');

      const gameResponse: GameResponseDTO = await this.gameService.sendAnswer(gameAnswerRequest, jwtPayload.id);
      const result: IControllerResponse<GameResponseDTO> = {
        success: true,
        message: 'Answer computed successfully.',
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
}

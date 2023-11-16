import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { GameResponseDTO } from '../dto/GameResponseDTO';
import { BusinessException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { ICustomRequest } from '../middleware/ValidateJwt';
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
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
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
}

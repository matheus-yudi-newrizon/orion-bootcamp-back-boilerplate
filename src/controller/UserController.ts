import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';
import { RequiredFieldException } from '../exception/RequiredFieldException';
import { IControllerResponse } from '../interface/IControllerResponse';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { BusinessException } from '../exception/BusinessException';
import { UserPostRequestDTO } from '../dto/UserPostRequestDTO';

export class UserController {
  /**
   * @swagger
   * /signup:
   *   post:
   *     summary: Register user data.
   *     tags: [Sign up]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     responses:
   *       '201':
   *           description: Returns the user created in the database.
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   success:
   *                     type: boolean
   *                   data:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       email:
   *                         type: string
   *                 example:
   *                   success: true
   *                   data:
   *                     id: 1
   *                     email: orion.bootcamp@email.com
   *       '400':
   *           description: Returns error (Password mismatch).
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   success:
   *                     type: boolean
   *                   message:
   *                     type: string
   *                 example:
   *                   success: false
   *                   message: PasswordMismatchException. The provided password does not match the confirmation password.
   */
  static async signup(req: Request, res: Response): Promise<void> {
    const result: IControllerResponse<UserResponseDTO> = {} as IControllerResponse<UserResponseDTO>;

    try {
      const userPostRequest: UserPostRequestDTO = req.body;
      const confirmPassword = req.body.confirmPassword;

      if (!userPostRequest.email) throw new RequiredFieldException('email');
      if (!userPostRequest.password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(userPostRequest.email);
      UserRequestValidator.validateUserPassword(userPostRequest.password, confirmPassword);

      const userResponse: UserResponseDTO = await UserService.createUser(userPostRequest);
      result.success = true;
      result.message = 'User created successfully';
      result.data = userResponse;

      res.status(201).json(result);
    } catch (error) {
      result.success = false;
      result.message = `${error.name}: ${error.message}`;

      if (error instanceof BusinessException) {
        res.status(error.status).json(result);
      } else {
        res.status(500).json(result);
      }
    }
  }
}

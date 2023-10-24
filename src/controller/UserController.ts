import { Request, Response } from 'express';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';
import { RequiredFieldException } from '../exception/RequiredFieldException';
import { IControllerResponse } from 'interface/IControllerResponse';
import { UserResponseDTO } from 'dto/UserResponseDTO';

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
   *           description: Returns the user created in database.
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
      const { email, password, confirmPassword } = req.body;

      if (!email) throw new RequiredFieldException('email');
      if (!password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(email);
      UserRequestValidator.validateUserPassword(password, confirmPassword);

      const user: UserResponseDTO = await UserService.createUser(email, password);
      result.success = true;
      result.message = 'User created successfully';
      result.data = user;

      res.status(201).json(result);
    } catch (error) {
      result.success = false;
      result.message = `${error.name}. ${error.message}`;

      res.status(error.status).json(result);
    }
  }
}

export default UserController;

import { Request, Response } from 'express';
import { Service as Controller } from 'typedi';
import { UserPostRequestDTO } from '../dto/UserPostRequestDTO';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { BusinessException, RequiredFieldException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword } = req.body;
      const userPostRequest: UserPostRequestDTO = { email: email, password: password };

      if (!userPostRequest.email) throw new RequiredFieldException('email');
      if (!userPostRequest.password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(userPostRequest.email);
      UserRequestValidator.validateUserPassword(userPostRequest.password, confirmPassword);

      const userResponse: UserResponseDTO = await this.userService.createUser(userPostRequest);
      const result: IControllerResponse<UserResponseDTO> = { success: true, message: 'User created successfully', data: userResponse };

      res.status(201).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = { success: false, message: `${error.name}. ${error.message}` };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }

  /**
   * @swagger
   * /forgot-password:
   *   post:
   *     summary: Request an email to recover password.
   *     tags: [Forgot password]
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
   *               email:
   *                 type: string
   *             example:
   *               email: orion.bootcamp@email.com
   *     responses:
   *       '200':
   *         description: Returns that a recovery email has been sent.
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
   *                 success: true
   *                 message: The recovery email has been sent.
   *       '400':
   *         description: Returns error (RequiredFieldException).
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
   *                 message: 'RequiredFieldException. Required field: email.'
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email: string = req.body.email;

      if (!email) throw new RequiredFieldException('email');

      UserRequestValidator.validateUserEmail(email);

      // TODO: userService.forgotPassword()
      const result: IControllerResponse<void> = { success: true, message: 'The recovery email has been sent.' };

      res.status(200).json(result);
    } catch (error) {
      const result: IControllerResponse<void> = { success: false, message: `${error.name}. ${error.message}` };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }
}

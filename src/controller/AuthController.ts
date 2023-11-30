import { LoginResponseDTO } from 'dto/LoginResponseDTO';
import { Request, Response } from 'express';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { Service as Controller } from 'typedi';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { BusinessException, RequiredFieldException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { JwtService } from '../security/JwtService';
import { AuthService } from '../service/AuthService';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  /**
   * @swagger
   * /auth/signup:
   *   post:
   *     tags:
   *       - auth
   *     summary: Create a new user in database
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SignUpRequest'
   *       required: true
   *     responses:
   *       '201':
   *         description: Return the user created in database
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: 'User created successfully.'
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
   *               OperationFailException:
   *                 value:
   *                   success: false
   *                   message: 'OperationFailException. Check your email address.'
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
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword } = req.body;
      const userPostRequest: IUserPostRequest = { email, password };

      if (!userPostRequest.email) throw new RequiredFieldException('email');
      if (!userPostRequest.password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(userPostRequest.email);
      UserRequestValidator.validateUserPassword(userPostRequest.password, confirmPassword);

      await this.userService.createUser(userPostRequest);
      const result: IControllerResponse<void> = {
        success: true,
        message: 'User created successfully.'
      };

      res.status(201).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags:
   *       - auth
   *     summary: Login an authenticated user
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *       required: true
   *     responses:
   *       '200':
   *         description: Returns a JWT if successful login and the user active game if found in database
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Successful login.'
   *               data:
   *                 token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE2LCJlbWFpbCI6Im9yaW9uLmJvb3RjYW1wQGVtYWlsLmNvbSIsImlhdCI6MTcwMDc1MDUyOX0.Ly8x6f0KOTiW_VmCbYa0b6ejKi4dF8dGydT4VFKj4oo'
   *                 game:
   *                   lives: 3
   *                   record: 40
   *                   combo: 9
   *                   isActive: true
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'RequiredFieldException. Required field: password.'
   *       '401':
   *         description: Return an authentication exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'AuthenticationFailedException. Authentication failed. Email or password is incorrect.'
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
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;
      const userCredentials: IUserPostRequest = { email, password };

      if (!userCredentials.email) throw new RequiredFieldException('email');
      if (!userCredentials.password) throw new RequiredFieldException('password');
      if (rememberMe == null) throw new RequiredFieldException('rememberMe');

      const loginResponse: LoginResponseDTO = await this.authService.login(userCredentials);
      const decoded = JwtService.verifyToken(loginResponse.accessToken, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;

      if (rememberMe) {
        const refreshToken = JwtService.generateToken({ id: decoded.id, email: decoded.email }, process.env.REFRESH_TOKEN_SECRET, '24h');
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
      }

      const result: IControllerResponse<LoginResponseDTO> = {
        success: true,
        message: 'Successful login.',
        data: loginResponse
      };

      res.status(200).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     tags:
   *       - auth
   *     summary: Request an email to recover password
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordRequest'
   *       required: true
   *     responses:
   *       '200':
   *         description: Return that a recovery email has been sent
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: 'The recovery email has been sent.'
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'RequiredFieldException. Required field: email.'
   *       '500':
   *         description: Return a server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               DatabaseOperationFailException:
   *                 value:
   *                   success: false
   *                   message: 'DatabaseOperationFailException. Unsuccessful database operation.'
   *               SendEmailFailException:
   *                 value:
   *                   success: false
   *                   message: 'SendEmailFailException. Unsuccessful operation.'
   */
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const email: string = req.body.email;

      if (!email) throw new RequiredFieldException('email');

      UserRequestValidator.validateUserEmail(email);

      await this.authService.forgotPassword(email);
      const result: IControllerResponse<void> = {
        success: true,
        message: 'The recovery email has been sent.'
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

  /**
   * @swagger
   * /auth/reset-password:
   *   put:
   *     tags:
   *       - auth
   *     summary: Reset user password
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordRequest'
   *       required: true
   *     responses:
   *       '200':
   *         description: Returns the password was changed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: 'Password change successfully.'
   *       '400':
   *         description: Return a custom exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             examples:
   *               PasswordNotValidException:
   *                 value:
   *                   success: false
   *                   message: 'PasswordNotValidException. The password must contain 8 characters, one uppercase letter, and one special character.'
   *               PasswordChangeFailedException:
   *                 value:
   *                   success: false
   *                   message: 'PasswordChangeFailedException. Password change failed.'
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
  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id, token, password, confirmPassword } = req.body;

      if (!id) throw new RequiredFieldException('id');
      if (!token) throw new RequiredFieldException('token');
      if (!password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserPassword(password, confirmPassword);

      await this.authService.resetPassword(id, password, token);
      const result: IControllerResponse<UserResponseDTO> = {
        success: true,
        message: 'Password change successfully.'
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

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     tags:
   *       - auth
   *     summary: Refresh JWT tokens: access and refresh
   *     parameters:
   *       - in: cookie
   *         name: refreshToken
   *         schema:
   *           type: string
   *         required: true
   *     responses:
   *       '201':
   *         description: Return JWT access token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponseData'
   *             example:
   *               success: true
   *               message: 'Access token generated.'
   *               data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTE2LCJlbWFpbCI6Im9yaW9uLmJvb3RjYW1wQGVtYWlsLmNvbSIsImlhdCI6MTcwMDc1MDUyOX0.Ly8x6f0KOTiW_VmCbYa0b6ejKi4dF8dGydT4VFKj4oo'
   *       '401':
   *         description: Return an authentication exception
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: false
   *               message: 'JsonWebTokenError. No refresh token provided.'
   */
  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      let refreshToken: string = req.cookies['refreshToken'];
      if (!refreshToken) throw new JsonWebTokenError('No refresh token provided.');

      const decoded = JwtService.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
      refreshToken = JwtService.generateToken({ id: decoded.id, email: decoded.email }, process.env.REFRESH_TOKEN_SECRET, '24h');
      const accessToken: string = JwtService.generateToken({ id: decoded.id, email: decoded.email }, process.env.ACCESS_TOKEN_SECRET, '1h');

      const result: IControllerResponse<string> = {
        success: true,
        message: 'Access token generated.',
        data: accessToken
      };

      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' }).status(201).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };

      res.status(401).json(result);
    }
  }

  /**
   * @swagger
   * /auth/confirm-email:
   *   put:
   *     tags:
   *       - auth
   *     summary: Confirm user email
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ConfirmEmailRequest'
   *       required: true
   *     responses:
   *       '200':
   *         description: Return the email was confirmed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *             example:
   *               success: true
   *               message: 'Email confirmed successfully.'
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
   *                   message: 'EntityNotFoundException. The token was not found in database.'
   *               OperationFailException:
   *                 value:
   *                   success: false
   *                   message: 'OperationFailException. The token is not valid.'
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
  public async confirmEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id, token } = req.body;

      if (!id) throw new RequiredFieldException('id');
      if (!token) throw new RequiredFieldException('token');

      await this.authService.confirmEmail(id, token);
      const result: IControllerResponse<void> = {
        success: true,
        message: 'Email confirmed successfully.'
      };

      res.status(200).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }
}

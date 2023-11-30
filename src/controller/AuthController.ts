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
   *     summary: Register a new user.
   *     tags: [Sign up]
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
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *             example:
   *               email: orion.bootcamp@email.com
   *               password: 12345678aA!
   *               confirmPassword: 12345678aA!
   *     responses:
   *       '201':
   *         description:  Returns a message indicating successful registration.
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
   *                 message: 'User created successfully'
   *       '400':
   *         description: Returns PasswordMismatchException.
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
   *                 message: 'PasswordMismatchException. The provided password does not match the confirmation password.'
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

      const result: IControllerResponse<UserResponseDTO> = {
        success: true,
        message: 'User register successfully'
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
   *     summary: Login an authenticated user.
   *     tags: [Login]
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
   *               password:
   *                 type: string
   *               rememberMe:
   *                 type: boolean
   *             example:
   *               email: orion.bootcamp@email.com
   *               password: 12345678aA!
   *               rememberMe: true
   *     responses:
   *       '200':
   *         description: >
   *           Return a JWT refresh token in a cookie named refreshToken if rememberMe is true.
   *           If successfully login, return the JWT access token and the user active game
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *               example: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTI5LCJlbWFpbCI6Im9yaW9uLmJvb3RjYW1wQGVtYWlsLmNvbSIsImlhdCI6MTcwMTI3MzAyMSwiZXhwIjoxNzAxMzU5NDIxfQ.eEsHjdizASxt6RWslDHZMgypd7zFXN1uewtjr0S19NM; Path=/; HttpOnly; SameSite=Strict
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
   *         description: Returns RequiredFieldException.
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
   *                 message: 'RequiredFieldException. Required field: password.'
   *       '401':
   *         description: Returns AuthenticationFailedException.
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
   *                 message: 'AuthenticationFailedException. Authentication failed. Email or password is incorrect.'
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
   *         description: Returns RequiredFieldException.
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
   *   post:
   *     tags:
   *       - auth
   *     summary: Reset user password.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: number
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *               token:
   *                 type: string
   *             example:
   *               id: 10
   *               password: 12345678aA!
   *               confirmPassword: 12345678aA!
   *               token: fjasdJDASAG43871233csafje
   *     responses:
   *       '200':
   *         description: Returns that the password was changed successfully.
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
   *                 message: 'Password change successfully.'
   *       '400':
   *         description: Returns PasswordChangeFailedException.
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
   *                 message: 'PasswordChangeFailedException: Password change failed.'
   *       '500':
   *         description: Returns Error.
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
   *                 message: 'Type error: property was undefined'
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
   * /auth/refresh-token:
   *   post:
   *     tags:
   *       - auth
   *     summary: Refresh JWT tokens
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
}

import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { Container } from 'typedi';
import { LoginResponseDTO, UserResponseDTO } from '../../src/dto';
import {
  AuthenticationFailedException,
  DatabaseOperationFailException,
  EmailNotValidException,
  EntityNotFoundException,
  InvalidJwtTokenException,
  OperationFailException,
  PasswordChangeFailedException,
  PasswordMismatchException,
  PasswordNotValidException,
  SendEmailFailException
} from '../../src/exception';
import { IUserPostRequest } from '../../src/interface';
import routes from '../../src/routes';
import { JwtService } from '../../src/security';
import { AuthService, UserService } from '../../src/service';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';
import { Generate } from '../mocks/Generate';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(routes);

const userService = Container.get(UserService);
const authService = Container.get(AuthService);

const generate = new Generate();

describe('AuthController', () => {
  describe('POST /auth/signup', () => {
    it('should return 201 and a success message', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockResolvedValue();

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const user = generate.signUpInput();
      user.email = undefined;

      const response = await request(app).post('/auth/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for password', async () => {
      const user = generate.signUpInput();
      user.password = undefined;

      const response = await request(app).post('/auth/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for confirmPassword', async () => {
      const user = generate.signUpInput();
      user.confirmPassword = undefined;

      const response = await request(app).post('/auth/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EmailNotValidException', async () => {
      const user = generate.signUpInput();
      user.email = user.email.replace('@', '');

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementation(() => {
        throw new EmailNotValidException();
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserEmail).toThrow(EmailNotValidException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and PasswordNotValidException', async () => {
      const user = generate.signUpInput();
      user.password = user.confirmPassword = '1234567890';

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementation(() => {
        throw new PasswordNotValidException();
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyValidateUserPassword).toThrow(PasswordNotValidException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and PasswordMismatchException', async () => {
      const user = generate.signUpInput();
      user.confirmPassword += '0b';

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementation(() => {
        throw new PasswordMismatchException();
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyValidateUserPassword).toThrow(PasswordMismatchException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and OperationFailException', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new OperationFailException('It was not possible to create user.');
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(OperationFailException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and SendEmailFailException', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new SendEmailFailException('It was not possible to send email.');
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(SendEmailFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).post('/auth/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 200 and the login response', async () => {
      const loginInput = generate.loginInput();
      const userCredentials: IUserPostRequest = { email: loginInput.email, password: loginInput.password };
      const loginResponse: LoginResponseDTO = generate.loginResponse();
      const userPayload: UserResponseDTO = generate.userPayload();

      const spyLogin = jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);
      const spyVerifyToken = jest.spyOn(JwtService, 'verifyToken').mockReturnValue(userPayload);
      const spyGenerateToken = jest.spyOn(JwtService, 'generateToken').mockReturnValue(generate.encodedJwt());

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(spyLogin).toHaveBeenCalledWith(userCredentials);
      expect(spyVerifyToken).toHaveBeenCalledWith(loginResponse.accessToken, process.env.ACCESS_TOKEN_SECRET);
      expect(spyGenerateToken).toHaveBeenCalledWith(userPayload, process.env.REFRESH_TOKEN_SECRET, '24h');
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(loginResponse);
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const loginInput = generate.loginInput();
      loginInput.email = undefined;

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for password', async () => {
      const loginInput = generate.loginInput();
      loginInput.password = undefined;

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for rememberMe', async () => {
      const loginInput = generate.loginInput();
      loginInput.rememberMe = undefined;

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 and AuthenticationFailedException', async () => {
      const loginInput = generate.loginInput();
      const userCredentials: IUserPostRequest = { email: loginInput.email, password: loginInput.password };

      const spyLogin = jest.spyOn(authService, 'login').mockImplementation(() => {
        throw new AuthenticationFailedException();
      });

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(spyLogin).toHaveBeenCalledWith(userCredentials);
      expect(spyLogin).toThrow(AuthenticationFailedException);
      expect(response.statusCode).toBe(401);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const loginInput = generate.loginInput();
      const userCredentials: IUserPostRequest = { email: loginInput.email, password: loginInput.password };

      const spyLogin = jest.spyOn(authService, 'login').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(spyLogin).toHaveBeenCalledWith(userCredentials);
      expect(spyLogin).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const loginInput = generate.loginInput();
      const userCredentials: IUserPostRequest = { email: loginInput.email, password: loginInput.password };

      const spyLogin = jest.spyOn(authService, 'login').mockImplementation(() => {
        throw new Error();
      });

      const response = await request(app).post('/auth/login').send(loginInput);

      expect(spyLogin).toHaveBeenCalledWith(userCredentials);
      expect(spyLogin).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return 200 and success true', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(authService, 'forgotPassword').mockResolvedValue();

      const response = await request(app).post('/auth/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const response = await request(app).post('/auth/forgot-password').send();

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EmailNotValidException', async () => {
      const userRequest = generate.forgotPasswordInput();
      userRequest.email.replace('@', '');

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementation(() => {
        throw new EmailNotValidException();
      });

      const response = await request(app).post('/auth/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyValidateUserEmail).toThrow(EmailNotValidException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and SendEmailFailException', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(authService, 'forgotPassword').mockImplementation(() => {
        throw new SendEmailFailException('Failed sending email.');
      });

      const response = await request(app).post('/auth/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(SendEmailFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(authService, 'forgotPassword').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/auth/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(authService, 'forgotPassword').mockImplementation(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).post('/auth/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('PUT /auth/reset-password', () => {
    it('should return 200 and success true', async () => {
      const userRequest = generate.resetPasswordInput();

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockResolvedValue();

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyResetPassword).toHaveBeenCalledWith(userRequest.id, userRequest.password, userRequest.token);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and RequiredFieldException for id', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.id = undefined;

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for token', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.token = undefined;

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for password', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.password = undefined;

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for confirmPassword', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.confirmPassword = undefined;

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and PasswordNotValidException', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.password = userRequest.confirmPassword = '1234567890';

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementation(() => {
        throw new PasswordNotValidException();
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyValidateUserPassword).toThrow(PasswordNotValidException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and PasswordMismatchException', async () => {
      const userRequest = generate.resetPasswordInput();
      userRequest.confirmPassword += '123';

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementation(() => {
        throw new PasswordMismatchException();
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyValidateUserPassword).toThrow(PasswordMismatchException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EntityNotFoundException', async () => {
      const userRequest = generate.resetPasswordInput();

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockImplementation(() => {
        throw new EntityNotFoundException('token');
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyResetPassword).toHaveBeenCalledWith(userRequest.id, userRequest.password, userRequest.token);
      expect(spyResetPassword).toThrow(EntityNotFoundException);
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 and PasswordChangeFailedException', async () => {
      const userRequest = generate.resetPasswordInput();

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockImplementation(() => {
        throw new PasswordChangeFailedException();
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyResetPassword).toHaveBeenCalledWith(userRequest.id, userRequest.password, userRequest.token);
      expect(spyResetPassword).toThrow(PasswordChangeFailedException);
      expect(response.statusCode).toBe(400);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const userRequest = generate.resetPasswordInput();

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyResetPassword).toHaveBeenCalledWith(userRequest.id, userRequest.password, userRequest.token);
      expect(spyResetPassword).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const userRequest = generate.resetPasswordInput();

      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyResetPassword = jest.spyOn(authService, 'resetPassword').mockImplementation(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).put('/auth/reset-password').send(userRequest);

      expect(spyValidateUserPassword).toHaveBeenCalledWith(userRequest.password, userRequest.confirmPassword);
      expect(spyResetPassword).toHaveBeenCalledWith(userRequest.id, userRequest.password, userRequest.token);
      expect(spyResetPassword).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should return 201 and refresh JWT tokens', async () => {
      const decoded = generate.userPayload();
      const jwt = generate.encodedJwt();
      const cookie = generate.cookieData();

      const spyVerifyToken = jest.spyOn(JwtService, 'verifyToken').mockReturnValue(decoded);
      const spyGenerateRefreshToken = jest.spyOn(JwtService, 'generateToken').mockReturnValue(jwt);
      const spyGenerateAccessToken = jest.spyOn(JwtService, 'generateToken').mockReturnValue(jwt);

      const response = await request(app).post('/auth/refresh-token').set('Cookie', cookie).send({});

      expect(spyVerifyToken).toHaveBeenCalledWith(jwt, process.env.REFRESH_TOKEN_SECRET);
      expect(spyGenerateRefreshToken).toHaveBeenCalledWith(decoded, process.env.REFRESH_TOKEN_SECRET, '24h');
      expect(spyGenerateAccessToken).toHaveBeenCalledWith(decoded, process.env.ACCESS_TOKEN_SECRET, '1h');
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(jwt);
    });

    it('should return 401 and InvalidJwtTokenException', async () => {
      const jwt = generate.encodedJwt();
      const cookie = generate.cookieData();

      const spyVerifyToken = jest.spyOn(JwtService, 'verifyToken').mockImplementation(() => {
        throw new InvalidJwtTokenException('InvalidJwt', 'Invalid token');
      });

      const response = await request(app).post('/auth/refresh-token').set('Cookie', cookie).send({});

      expect(spyVerifyToken).toHaveBeenCalledWith(jwt, process.env.REFRESH_TOKEN_SECRET);
      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 and JsonWebTokenError', async () => {
      const response = await request(app).post('/auth/refresh-token').set('Cookie', '').send({});

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /auth/confirm-email', () => {
    it('should return 200 and a success message', async () => {
      const input = generate.confirmEmailInput();

      const spyConfirmEmail = jest.spyOn(authService, 'confirmEmail').mockResolvedValue();

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(spyConfirmEmail).toHaveBeenCalledWith(input.id, input.token);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and EntityNotFoundException', async () => {
      const input = generate.confirmEmailInput();

      const spyConfirmEmail = jest.spyOn(authService, 'confirmEmail').mockImplementation(() => {
        throw new EntityNotFoundException('token');
      });

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(spyConfirmEmail).toHaveBeenCalledWith(input.id, input.token);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and OperationFailException', async () => {
      const input = generate.confirmEmailInput();

      const spyConfirmEmail = jest.spyOn(authService, 'confirmEmail').mockImplementation(() => {
        throw new OperationFailException('The token is not valid.');
      });

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(spyConfirmEmail).toHaveBeenCalledWith(input.id, input.token);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const input = generate.confirmEmailInput();

      const spyConfirmEmail = jest.spyOn(authService, 'confirmEmail').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(spyConfirmEmail).toHaveBeenCalledWith(input.id, input.token);
      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for id', async () => {
      const input = generate.confirmEmailInput();
      input.id = undefined;

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for token', async () => {
      const input = generate.confirmEmailInput();
      input.token = undefined;

      const response = await request(app).put('/auth/confirm-email').send(input);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

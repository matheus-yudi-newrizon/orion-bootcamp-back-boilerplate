import express from 'express';
import request from 'supertest';
import { Container } from 'typedi';
import {
  DatabaseOperationFailException,
  EmailNotValidException,
  PasswordMismatchException,
  PasswordNotValidException,
  SendEmailFailException,
  UserAlreadyExistsException
} from '../../src/exception';
import routes from '../../src/routes';
import { UserService } from '../../src/service/UserService';
import { UserRequestValidator } from '../../src/validation/UserRequestValidator';
import { Generate } from '../mocks/Generate';

const app = express();
app.use(express.json());
app.use(routes);

const userService = Container.get(UserService);
const generate = new Generate();

describe('UserController', () => {
  describe('POST /signup', () => {
    it('should return 201 and the user created', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockResolvedValue(generate.userPayload());

      const response = await request(app).post('/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ success: true, message: 'User created successfully', data: generate.userPayload() });
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const user = generate.signUpInput();
      user.email = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for password', async () => {
      const user = generate.signUpInput();
      user.password = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and RequiredFieldException for confirmPassword', async () => {
      const user = generate.signUpInput();
      user.confirmPassword = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EmailNotValidException', async () => {
      const user = generate.signUpInput();
      user.email = user.email.replace('@', '');

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementation(() => {
        throw new EmailNotValidException();
      });

      const response = await request(app).post('/signup').send(user);

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

      const response = await request(app).post('/signup').send(user);

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

      const response = await request(app).post('/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyValidateUserPassword).toThrow(PasswordMismatchException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and UserAlreadyExistsException', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new UserAlreadyExistsException(user.email);
      });

      const response = await request(app).post('/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(UserAlreadyExistsException);
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

      const response = await request(app).post('/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const user = generate.signUpInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyValidateUserPassword = jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      const spyCreateUser = jest.spyOn(userService, 'createUser').mockImplementation(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).post('/signup').send(user);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(user.email);
      expect(spyValidateUserPassword).toHaveBeenCalledWith(user.password, user.confirmPassword);
      expect(spyCreateUser).toHaveBeenCalledWith(generate.userPostRequest());
      expect(spyCreateUser).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /forgot-password', () => {
    it('should return 200 and success true', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(userService, 'forgotPassword').mockResolvedValue();

      const response = await request(app).post('/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const response = await request(app).post('/forgot-password').send();

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 and EmailNotValidException', async () => {
      const userRequest = generate.forgotPasswordInput();
      userRequest.email.replace('@', '');

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementation(() => {
        throw new EmailNotValidException();
      });

      const response = await request(app).post('/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyValidateUserEmail).toThrow(EmailNotValidException);
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 and SendEmailFailException', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(userService, 'forgotPassword').mockImplementation(() => {
        throw new SendEmailFailException('Failed sending email.');
      });

      const response = await request(app).post('/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(SendEmailFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(userService, 'forgotPassword').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(DatabaseOperationFailException);
      expect(response.statusCode).toBe(500);
    });

    it('should return 500 and Error', async () => {
      const userRequest = generate.forgotPasswordInput();

      const spyValidateUserEmail = jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      const spyForgotPassword = jest.spyOn(userService, 'forgotPassword').mockImplementation(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).post('/forgot-password').send(userRequest);

      expect(spyValidateUserEmail).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toHaveBeenCalledWith(userRequest.email);
      expect(spyForgotPassword).toThrow(Error);
      expect(response.statusCode).toBe(500);
    });
  });
});

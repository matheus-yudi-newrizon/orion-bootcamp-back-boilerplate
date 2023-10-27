import express from 'express';
import routes from '../../routes';
import request from 'supertest';
import { userPayload, userInput } from '../utils/generate';
import { UserRequestValidator } from '../../validation/UserRequestValidator';
import { UserService } from '../../service/UserService';
import {
  DatabaseOperationFailException,
  EmailNotValidException,
  PasswordMismatchException,
  PasswordNotValidException,
  UserAlreadyExistsException
} from '../../exception';

const app = express();
app.use(express.json());
app.use(routes);

describe('UserController', () => {
  describe('POST /signup', () => {
    it('should return 201 and the user created', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockResolvedValue(userPayload());

      const response = await request(app).post('/signup').send(userInput());

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ success: true, message: 'User created successfully', data: userPayload() });
    });

    it('should return 400 and RequiredFieldException for email', async () => {
      const user = userInput();
      user.email = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'RequiredFieldException. Required field: email' });
    });

    it('should return 400 and RequiredFieldException for password', async () => {
      const user = userInput();
      user.password = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'RequiredFieldException. Required field: password' });
    });

    it('should return 400 and RequiredFieldException for confirmPassword', async () => {
      const user = userInput();
      user.confirmPassword = undefined;

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'RequiredFieldException. Required field: confirmPassword' });
    });

    it('should return 400 and EmailNotValidException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementationOnce(() => {
        throw new EmailNotValidException();
      });
      const user = userInput();
      user.email = user.email.replace('@', '');

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ success: false, message: 'EmailNotValidException. The email is not a valid email address.' });
    });

    it('should return 400 and PasswordNotValidException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementationOnce(() => {
        throw new PasswordNotValidException();
      });
      const user = userInput();
      user.password = user.confirmPassword = '1234567890';

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'PasswordNotValidException. The password must contain 8 characters, one uppercase letter, and one special character.'
      });
    });

    it('should return 400 and PasswordMismatchException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementationOnce(() => {
        throw new PasswordMismatchException();
      });
      const user = userInput();
      user.password += '#$%123bcDE';

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'PasswordMismatchException. The provided password does not match the confirmation password.'
      });
    });

    it('should return 400 and UserAlreadyExistsException', async () => {
      const user = userInput();
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockImplementationOnce(() => {
        throw new UserAlreadyExistsException(user.email);
      });

      const response = await request(app).post('/signup').send(user);

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: `UserAlreadyExistsException. The user with email '${user.email}' already exists.`
      });
    });

    it('should return 500 and DatabaseOperationFailException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockImplementationOnce(() => {
        throw new DatabaseOperationFailException();
      });

      const response = await request(app).post('/signup').send(userInput());

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'DatabaseOperationFailException. Unsuccessful database operation.'
      });
    });

    it('should return 500 and Error', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockImplementationOnce(() => {
        throw new Error('Internal Server Error.');
      });

      const response = await request(app).post('/signup').send(userInput());

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Error. Internal Server Error.'
      });
    });
  });
});

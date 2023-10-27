import { userPayload, userInput } from '../utils/generate';
import { UserRequestValidator } from '../../validation/UserRequestValidator';
import { createRequest, createResponse } from 'node-mocks-http';
import { UserService } from '../../service/UserService';
import { UserController } from '../../controller/UserController';
import {
  DatabaseOperationFailException,
  EmailNotValidException,
  PasswordMismatchException,
  PasswordNotValidException,
  UserAlreadyExistsException
} from '../../exception';

describe('UserController', () => {
  describe('POST /signup', () => {
    it('should return 201 and the user created', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockResolvedValue(userPayload());

      const request = createRequest({ method: 'POST', url: '/signup', body: userInput() });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = await response._getJSONData();

      expect(response.statusCode).toBe(201);
      expect(data).toEqual({ success: true, message: 'User created successfully', data: userPayload() });
    });

    it('should return 400 and RequiredFieldException', async () => {
      const user = userInput();
      user.email = undefined;

      const request = createRequest({ method: 'POST', url: '/signup', body: user });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({ success: false, message: 'RequiredFieldException. Required field: email' });
    });

    it('should return 400 and RequiredFieldException', async () => {
      const user = userInput();
      user.password = undefined;

      const request = createRequest({ method: 'POST', url: '/signup', body: user });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({ success: false, message: 'RequiredFieldException. Required field: password' });
    });

    it('should return 400 and RequiredFieldException', async () => {
      const user = userInput();
      user.confirmPassword = undefined;

      const request = createRequest({ method: 'POST', url: '/signup', body: user });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({ success: false, message: 'RequiredFieldException. Required field: confirmPassword' });
    });

    it('should return 400 and EmailNotValidException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockImplementationOnce(() => {
        throw new EmailNotValidException();
      });

      const request = createRequest({ method: 'POST', url: '/signup', body: userInput() });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({ success: false, message: 'EmailNotValidException. The email is not a valid email address.' });
    });

    it('should return 400 and PasswordNotValidException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementationOnce(() => {
        throw new PasswordNotValidException();
      });

      const request = createRequest({ method: 'POST', url: '/signup', body: userInput() });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({
        success: false,
        message: 'PasswordNotValidException. The password must contain 8 characters, one uppercase letter, and one special character.'
      });
    });

    it('should return 400 and PasswordMismatchException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockImplementationOnce(() => {
        throw new PasswordMismatchException();
      });

      const request = createRequest({ method: 'POST', url: '/signup', body: userInput() });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({
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

      const request = createRequest({ method: 'POST', url: '/signup', body: user });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(400);
      expect(data).toEqual({
        success: false,
        message: `UserAlreadyExistsException. The user with email '${user.email}' already exists.`
      });
    });

    it('should return 500 and DataBaseOperationFailException', async () => {
      jest.spyOn(UserRequestValidator, 'validateUserEmail').mockReturnValueOnce();
      jest.spyOn(UserRequestValidator, 'validateUserPassword').mockReturnValueOnce();
      jest.spyOn(UserService, 'createUser').mockImplementationOnce(() => {
        throw new DatabaseOperationFailException();
      });

      const request = createRequest({ method: 'POST', url: '/signup', body: userInput() });
      const response = createResponse();

      await UserController.signup(request, response);
      const data = response._getJSONData();

      expect(response.statusCode).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});

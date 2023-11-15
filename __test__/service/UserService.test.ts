import { Container } from 'typedi';
import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { User } from '../../src/entity/User';
import { DatabaseOperationFailException, UserAlreadyExistsException } from '../../src/exception';
import { IUserPostRequest } from '../../src/interface/IUserPostRequest';
import { UserRepository } from '../../src/repository/UserRepository';
import { PasswordEncrypt } from '../../src/security/PasswordEncrypt';
import { UserService } from '../../src/service/UserService';
import { Generate } from '../mocks/Generate';

const userService = Container.get(UserService);
const userRepository = Container.get(UserRepository);

const generate = new Generate();

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user', async () => {
      const user: User = generate.userData();
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const userResponse: UserResponseDTO = generate.userPayload();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(userPostRequest.password);
      const spyCreate = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySave = jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result: UserResponseDTO = await userService.createUser(userPostRequest);

      expect(result).toEqual(userResponse);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalledWith(userPostRequest.password);
      expect(spyCreate).toHaveBeenCalledWith(userPostRequest);
      expect(spySave).toHaveBeenCalledWith(user);
    });

    it('should throw UserAlreadyExistsException if the user already exists', async () => {
      const user: User = generate.userData();
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(UserAlreadyExistsException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
    });

    it('should throw DatabaseOperationFailException if operation fails while creating User', async () => {
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(userPostRequest.password);
      const spyCreate = jest.spyOn(userRepository, 'create').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalledWith(userPostRequest.password);
      expect(spyCreate).toHaveBeenCalledWith(userPostRequest);
    });

    it('should throw DatabaseOperationFailException if operation fails while saving User', async () => {
      const user: User = generate.userData();
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(userPostRequest.password);
      const spyCreate = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySave = jest.spyOn(userRepository, 'save').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalledWith(userPostRequest.password);
      expect(spyCreate).toHaveBeenCalledWith(userPostRequest);
      expect(spySave).toHaveBeenCalledWith(user);
    });
  });
});

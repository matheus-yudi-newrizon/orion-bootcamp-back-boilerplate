import { Container } from 'typedi';
import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { User } from '../../src/entity/User';
import { UserAlreadyExistsException } from '../../src/exception';
import { IUserPostRequest } from '../../src/interface/IUserPostRequest';
import { UserRepository } from '../../src/repository/UserRepository';
import { UserService } from '../../src/service/UserService';

const userService = Container.get(UserService);
const userRepository = Container.get(UserRepository);

describe('UserService', () => {
  describe('createUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'testpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date()
      };

      jest.spyOn(userRepository, 'getByEmail').mockImplementation(async () => {
        return user;
      });
      jest.spyOn(userRepository, 'create').mockImplementation(() => {
        return user;
      });
      jest.spyOn(userRepository, 'save').mockImplementation(async () => {
        return user;
      });
    });

    it('should create a new user', async () => {
      const userPostRequest: IUserPostRequest = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const userResponse: UserResponseDTO = {
        id: 1,
        email: userPostRequest.email
      };

      jest.spyOn(userRepository, 'getByEmail').mockImplementation(async () => {
        return null;
      });

      const result = await userService.createUser(userPostRequest);

      expect(result).toEqual(userResponse);
    });

    it('should throw UserAlreadyExistsException if the user already exists', async () => {
      const userPostRequest: IUserPostRequest = {
        email: 'existing@example.com',
        password: 'testpassword'
      };

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});

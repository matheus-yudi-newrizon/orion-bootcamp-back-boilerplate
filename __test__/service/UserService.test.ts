import { Container } from 'typedi';
import { UserPostRequestDTO } from '../../src/dto/UserPostRequestDTO';
import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { User } from '../../src/entity/User';
import { UserAlreadyExistsException } from '../../src/exception';
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
      const userDTO: UserPostRequestDTO = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const userResponse: UserResponseDTO = {
        id: 1,
        email: userDTO.email
      };

      jest.spyOn(userRepository, 'getByEmail').mockImplementation(async () => {
        return null;
      });

      const result = await userService.createUser(userDTO);

      expect(result).toEqual(userResponse);
    });

    it('should throw UserAlreadyExistsException if the user already exists', async () => {
      const userDTO: UserPostRequestDTO = {
        email: 'existing@example.com',
        password: 'testpassword'
      };

      await expect(userService.createUser(userDTO)).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});

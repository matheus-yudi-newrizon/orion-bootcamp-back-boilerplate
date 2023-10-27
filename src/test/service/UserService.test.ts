import { UserAlreadyExistsException } from '../../exception/UserAlreadyExistsException';
import { UserRepository } from '../../repository/UserRepository';
import { UserService } from '../../service/UserService';

describe('UserService', () => {
  describe('createUser', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'testpassword'
      };

      jest.spyOn(UserRepository, 'getByEmail').mockImplementation(async () => {
        return user;
      });
      jest.spyOn(UserRepository, 'create').mockImplementation(() => {
        return user;
      });
      jest.spyOn(UserRepository, 'save').mockImplementation(async () => {
        return user;
      });
    });

    it('should create a new user', async () => {
      const userDTO = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const userResponse = {
        id: 1,
        email: userDTO.email
      };

      jest.spyOn(UserRepository, 'getByEmail').mockImplementation(async () => {
        return null;
      });

      const result = await UserService.createUser(userDTO);

      expect(result).toEqual(userResponse);
    });

    it('should throw UserAlreadyExistsException if the user already exists', async () => {
      const userDTO = {
        email: 'existing@example.com',
        password: 'testpassword'
      };

      await expect(UserService.createUser(userDTO)).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});

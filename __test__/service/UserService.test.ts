import { Container } from 'typedi';
import { Token, User } from '../../src/entity';
import { DatabaseOperationFailException, OperationFailException, SendEmailFailException } from '../../src/exception';
import { IUserPostRequest } from '../../src/interface';
import { TokenRepository, UserRepository } from '../../src/repository';
import { PasswordEncrypt } from '../../src/security';
import { UserService } from '../../src/service';
import { EmailService } from '../../src/utils/EmailService';
import { Generate } from '../mocks/Generate';

const userService = Container.get(UserService);
const userRepository = Container.get(UserRepository);
const tokenRepository = Container.get(TokenRepository);

const generate = new Generate();

describe('UserService', () => {
  describe('createUser', () => {
    it('should send a confirmation email if created a new user', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreateUser = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySaveUser = jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      const spyCreateToken = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySaveToken = jest.spyOn(tokenRepository, 'save').mockResolvedValue(token);
      const spySendEmail = jest.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await userService.createUser(userPostRequest);

      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateUser).toHaveBeenCalledWith(userPostRequest);
      expect(spySaveUser).toHaveBeenCalledWith(user);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateToken).toHaveBeenCalledWith({ user, token: hashed });
      expect(spySaveToken).toHaveBeenCalledWith(token);
      expect(spySendEmail).toHaveBeenCalled();
    });

    it('should send a confirmation email if user is already created but has an expired token', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();
      const expiredToken: Token = generate.expiredTokenData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreate = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySave = jest.spyOn(tokenRepository, 'save').mockResolvedValue(token);
      const spySendEmail = jest.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await userService.createUser(userPostRequest);

      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(user.id);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ user, token: hashed });
      expect(spySave).toHaveBeenCalledWith(token);
      expect(spySendEmail).toHaveBeenCalled();
    });

    it('should throw OperationFailException if the user is active', async () => {
      const user: User = generate.userData();
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(OperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
    });

    it('should throw OperationFailException if the token is not expired', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(OperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while finding User', async () => {
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
    });

    it('should throw DatabaseOperationFailException if operation fails while finding Token', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while deleting Token', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(generate.expiredTokenData());
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(user.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while creating User', async () => {
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreate = jest.spyOn(userRepository, 'create').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith(userPostRequest);
    });

    it('should throw DatabaseOperationFailException if operation fails while saving User', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreate = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySave = jest.spyOn(userRepository, 'save').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith(userPostRequest);
      expect(spySave).toHaveBeenCalledWith(user);
    });

    it('should throw DatabaseOperationFailException if operation fails while creating Token', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreateUser = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySaveUser = jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      const spyCreateToken = jest.spyOn(tokenRepository, 'create').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateUser).toHaveBeenCalledWith(userPostRequest);
      expect(spySaveUser).toHaveBeenCalledWith(user);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateToken).toHaveBeenCalledWith({ user, token: hashed });
    });

    it('should throw DatabaseOperationFailException if operation fails while saving Token', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreateUser = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySaveUser = jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      const spyCreateToken = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySaveToken = jest.spyOn(tokenRepository, 'save').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateUser).toHaveBeenCalledWith(userPostRequest);
      expect(spySaveUser).toHaveBeenCalledWith(user);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateToken).toHaveBeenCalledWith({ user, token: hashed });
      expect(spySaveToken).toHaveBeenCalledWith(token);
    });

    it('should throw SendEmailFailException if operation fails while sending email', async () => {
      const user: User = generate.userData(false);
      const userPostRequest: IUserPostRequest = generate.userPostRequest();
      const hashed: string = generate.hashedPassword();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyCreateUser = jest.spyOn(userRepository, 'create').mockReturnValue(user);
      const spySaveUser = jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      const spyCreateToken = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySaveToken = jest.spyOn(tokenRepository, 'save').mockResolvedValue(token);
      const spySendEmail = jest.spyOn(EmailService, 'sendEmail').mockImplementation(() => {
        throw new SendEmailFailException('Failed sending mail.');
      });

      await expect(userService.createUser(userPostRequest)).rejects.toThrow(SendEmailFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userPostRequest.email);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateUser).toHaveBeenCalledWith(userPostRequest);
      expect(spySaveUser).toHaveBeenCalledWith(user);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreateToken).toHaveBeenCalledWith({ user, token: hashed });
      expect(spySaveToken).toHaveBeenCalledWith(token);
      expect(spySendEmail).toHaveBeenCalled();
    });
  });
});

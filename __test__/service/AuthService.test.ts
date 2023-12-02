import { Container } from 'typedi';
import { UpdateResult } from 'typeorm';
import { LoginResponseDTO } from '../../src/dto';
import { Token, User } from '../../src/entity';
import {
  AuthenticationFailedException,
  DatabaseOperationFailException,
  EntityNotFoundException,
  PasswordChangeFailedException,
  SendEmailFailException
} from '../../src/exception';
import { IUserPostRequest } from '../../src/interface';
import { GameRepository, TokenRepository, UserRepository } from '../../src/repository';
import { JwtService, PasswordEncrypt } from '../../src/security';
import { AuthService } from '../../src/service';
import { EmailService } from '../../src/utils/EmailService';
import { Generate } from '../mocks/Generate';

const authService = Container.get(AuthService);
const userRepository = Container.get(UserRepository);
const gameRepository = Container.get(GameRepository);
const tokenRepository = Container.get(TokenRepository);

const generate = new Generate();

describe('AuthService', () => {
  describe('login', () => {
    it('should return the login response with active game', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();
      user.loginCount += 1;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGetActiveGame = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(generate.newGame());
      const spyGenerate = jest.spyOn(JwtService, 'generateToken').mockReturnValue(generate.encodedJwt());

      const result: LoginResponseDTO = await authService.login(userDTO);

      expect(result).toEqual(generate.loginResponse());
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
      expect(spyCompare).toHaveBeenCalledWith(userDTO.password, user.password);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { loginCount: user.loginCount });
      expect(spyGetActiveGame).toHaveBeenCalledWith(user);
      expect(spyGenerate).toHaveBeenCalledWith({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, '1h');
    });

    it('should return the login response without a game', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();
      user.loginCount += 1;
      const loginResponse: LoginResponseDTO = generate.loginResponse();
      loginResponse.game = null;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGetActiveGame = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);
      const spyGenerate = jest.spyOn(JwtService, 'generateToken').mockReturnValue(generate.encodedJwt());

      const result: LoginResponseDTO = await authService.login(userDTO);

      expect(result).toEqual(loginResponse);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
      expect(spyCompare).toHaveBeenCalledWith(userDTO.password, user.password);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { loginCount: user.loginCount });
      expect(spyGetActiveGame).toHaveBeenCalledWith(user);
      expect(spyGenerate).toHaveBeenCalledWith({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, '1h');
    });

    it('should throw AuthenticationFailedException if the email is incorrect', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(null);

      await expect(authService.login(userDTO)).rejects.toThrow(AuthenticationFailedException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
    });

    it('should throw AuthenticationFailedException if the user is not active', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();
      user.isActive = false;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);

      await expect(authService.login(userDTO)).rejects.toThrow(AuthenticationFailedException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
    });

    it('should throw AuthenticationFailedException if the password is incorrect', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(userDTO)).rejects.toThrow(AuthenticationFailedException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
      expect(spyCompare).toHaveBeenCalledWith(userDTO.password, user.password);
    });

    it('should throw DatabaseOperationFailException if the database operation fails finding user', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.login(userDTO)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
    });

    it('should throw DatabaseOperationFailException if the database operation fails updating user', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();
      user.loginCount += 1;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.login(userDTO)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
      expect(spyCompare).toHaveBeenCalledWith(userDTO.password, user.password);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { loginCount: user.loginCount });
    });

    it('should throw DatabaseOperationFailException if the database operation fails finding active game', async () => {
      const { email, password } = generate.loginInput();
      const userDTO: IUserPostRequest = { email, password };
      const user: User = generate.userData();
      user.loginCount += 1;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGetActiveGame = jest.spyOn(gameRepository, 'getActiveGameByUser').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.login(userDTO)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(userDTO.email);
      expect(spyCompare).toHaveBeenCalledWith(userDTO.password, user.password);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { loginCount: user.loginCount });
      expect(spyGetActiveGame).toHaveBeenCalledWith(user);
    });
  });

  describe('forgotPassword', () => {
    it('should send an email if token is expired', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const expiredToken: Token = generate.expiredTokenData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(token.token);
      const spyCreate = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySave = jest.spyOn(tokenRepository, 'save').mockResolvedValue(token);
      const spySendEmail = jest.spyOn(EmailService, 'sendEmail').mockResolvedValue();

      await authService.forgotPassword(input.email);

      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(expiredToken.id);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ user: token.user, token: token.token });
      expect(spySave).toHaveBeenCalledWith(token);
      expect(spySendEmail).toHaveBeenCalled();
    });

    it('should return empty if token is not expired', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);

      await authService.forgotPassword(input.email);

      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
    });

    it('should do nothing if user is not active', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      user.isActive = false;

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);

      await authService.forgotPassword(input.email);

      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
    });

    it('should throw DatabaseOperationFailException if operation fails while finding user by email', async () => {
      const input = generate.forgotPasswordInput();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
    });

    it('should throw DatabaseOperationFailException if operation fails while finding token by id', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while deleting token by id', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const expiredToken: Token = generate.expiredTokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(expiredToken.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while creating token', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const expiredToken: Token = generate.expiredTokenData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(token.token);
      const spyCreate = jest.spyOn(tokenRepository, 'create').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(expiredToken.id);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ user: token.user, token: token.token });
    });

    it('should throw DatabaseOperationFailException if operation fails while saving token', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const expiredToken: Token = generate.expiredTokenData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(token.token);
      const spyCreate = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySave = jest.spyOn(tokenRepository, 'save').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(expiredToken.id);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ user: token.user, token: token.token });
      expect(spySave).toHaveBeenCalledWith(token);
    });

    it('should throw SendEmailFailException if there is a failure sending email', async () => {
      const input = generate.forgotPasswordInput();
      const user: User = generate.userData();
      const expiredToken: Token = generate.expiredTokenData();
      const token: Token = generate.tokenData();

      const spyGetByEmail = jest.spyOn(userRepository, 'getByEmail').mockResolvedValue(user);
      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(token.token);
      const spyCreate = jest.spyOn(tokenRepository, 'create').mockReturnValue(token);
      const spySave = jest.spyOn(tokenRepository, 'save').mockResolvedValue(token);
      const spySendEmail = jest.spyOn(EmailService, 'sendEmail').mockImplementation(() => {
        throw new SendEmailFailException('Failure sending email.');
      });

      await expect(authService.forgotPassword(input.email)).rejects.toThrow(SendEmailFailException);
      expect(spyGetByEmail).toHaveBeenCalledWith(input.email);
      expect(spyFindById).toHaveBeenCalledWith(user.id);
      expect(spyDeleteById).toHaveBeenCalledWith(expiredToken.id);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ user: token.user, token: token.token });
      expect(spySave).toHaveBeenCalledWith(token);
      expect(spySendEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset the user password with a valid token', async () => {
      const input = generate.resetPasswordInput();
      const token: Token = generate.tokenData();
      const hashed: string = generate.hashedPassword();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockResolvedValue();

      await authService.resetPassword(input.id, input.password, input.token);

      expect(spyFindById).toHaveBeenCalledWith(input.id);
      expect(spyCompare).toHaveBeenCalledWith(input.token, token.token);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyUpdate).toHaveBeenCalledWith(input.id, { password: hashed });
      expect(spyDeleteById).toHaveBeenCalledWith(input.id);
    });

    it('should throw EntityNotFoundException if the token was not found in the database', async () => {
      const input = generate.resetPasswordInput();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(null);

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(EntityNotFoundException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
    });

    it('should throw PasswordChangeFailedException if the token found in database is not valid', async () => {
      const input = generate.resetPasswordInput();
      const expiredToken: Token = generate.expiredTokenData();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(expiredToken);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(PasswordChangeFailedException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
      expect(spyCompare).toHaveBeenCalledWith(input.token, expiredToken.token);
    });

    it('should throw PasswordChangeFailedException if the token found in database does not match', async () => {
      const input = generate.resetPasswordInput();
      const token: Token = generate.expiredTokenData();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(false);

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(PasswordChangeFailedException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
      expect(spyCompare).toHaveBeenCalledWith(input.token, token.token);
    });

    it('should throw DatabaseOperationFailException if operation fails while finding token by id', async () => {
      const input = generate.resetPasswordInput();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
    });

    it('should throw DatabaseOperationFailException if operation fails while updating user', async () => {
      const input = generate.resetPasswordInput();
      const token: Token = generate.tokenData();
      const hashed: string = generate.hashedPassword();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
      expect(spyCompare).toHaveBeenCalledWith(input.token, token.token);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyUpdate).toHaveBeenCalledWith(input.id, { password: hashed });
    });

    it('should throw DatabaseOperationFailException if operation fails while deleting token', async () => {
      const input = generate.resetPasswordInput();
      const token: Token = generate.tokenData();
      const hashed: string = generate.hashedPassword();

      const spyFindById = jest.spyOn(tokenRepository, 'findById').mockResolvedValue(token);
      const spyCompare = jest.spyOn(PasswordEncrypt, 'compare').mockResolvedValue(true);
      const spyEncrypt = jest.spyOn(PasswordEncrypt, 'encrypt').mockResolvedValue(hashed);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyDeleteById = jest.spyOn(tokenRepository, 'deleteById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(authService.resetPassword(input.id, input.password, input.token)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyFindById).toHaveBeenCalledWith(input.id);
      expect(spyCompare).toHaveBeenCalledWith(input.token, token.token);
      expect(spyEncrypt).toHaveBeenCalled();
      expect(spyUpdate).toHaveBeenCalledWith(input.id, { password: hashed });
      expect(spyDeleteById).toHaveBeenCalledWith(input.id);
    });
  });
});

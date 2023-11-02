import * as crypto from 'crypto';
import { Service } from 'typedi';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { Token } from '../entity/Token';
import { User } from '../entity/User';
import { UserAlreadyExistsException } from '../exception';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { TokenRepository } from '../repository/TokenRepository';
import { UserRepository } from '../repository/UserRepository';
import { PasswordEncrypt } from '../security/PasswordEncrypt';
import { EmailService } from '../utils/EmailService';

@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ) {}

  /**
   * Creates a new user with the provided userPostRequest.
   *
   * @param userPostRequest - The user data including email and password.
   *
   * @returns A promise that resolves with the created user.
   * @throws {UserAlreadyExistsException} if the user already exists.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async createUser(userPostRequest: IUserPostRequest): Promise<UserResponseDTO> {
    const userByEmail: User = await this.userRepository.getByEmail(userPostRequest.email);
    if (userByEmail) throw new UserAlreadyExistsException(userPostRequest.email);

    const passwordEncrypted: string = await PasswordEncrypt.encrypt(userPostRequest.password);
    userPostRequest.password = passwordEncrypted;

    const user: User = this.userRepository.create(userPostRequest);
    await this.userRepository.save(user);

    return new UserResponseDTO(user);
  }

  /**
   * Initiates a reset password flow. Finds user by email, generates a token and sends the recovery email.
   *
   * @param email - The user email.
   *
   * @returns A promise that resolves with void.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   * @throws {SendEmailFailException} if there is a failure sending email.
   */
  public async forgotPassword(email: string): Promise<void> {
    const user: User = await this.userRepository.getByEmail(email);

    if (user) {
      const oldToken: Token = await this.tokenRepository.findById(user.id);

      if (oldToken) {
        const expiresIn: number = oldToken.createdAt.getTime() + 1800000;
        const currentTime: number = new Date().getTime();

        if (expiresIn > currentTime) return;

        await this.tokenRepository.deleteById(user.id);
      }

      const resetToken: string = crypto.randomBytes(32).toString('hex');
      const hash: string = await PasswordEncrypt.encrypt(resetToken);

      await this.tokenRepository.save({ user: user, token: hash });

      const username: string = user.email.slice(0, user.email.indexOf('@'));
      const link: string = `http://localhost:4200/reset-password?token=${resetToken}&id=${user.id}`;

      EmailService.sendEmail(
        user.email,
        'Orion Bootcamp | Password Reset Request',
        { username: username, link: link },
        './template/ForgotPassword.handlebars'
      );
    }
  }
}

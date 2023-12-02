import * as crypto from 'crypto';
import { Service } from 'typedi';
import { Token, User } from '../entity';
import { OperationFailException } from '../exception';
import { IUserPostRequest } from '../interface';
import { TokenRepository, UserRepository } from '../repository';
import { PasswordEncrypt } from '../security';
import { EmailService } from '../utils/EmailService';

@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ) {}

  /**
   * Creates a new user with the provided user data.
   *
   * @param userDTO - The user data including email and password.
   *
   * @returns A promise that resolves with the created user.
   * @throws {OperationFailException} if the operation fails.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   * @throws {SendEmailFailException} if there is a failure sending email.
   */
  public async createUser(userDTO: IUserPostRequest): Promise<void> {
    let user: User = await this.userRepository.getByEmail(userDTO.email);
    if (user?.isActive) throw new OperationFailException('It was not possible to create user.');

    if (user) {
      const oldToken: Token = await this.tokenRepository.findById(user.id);

      if (oldToken) {
        const expiresIn: number = oldToken.createdAt.getTime() + 1800000;
        const currentTime: number = new Date().getTime();

        if (expiresIn > currentTime) throw new OperationFailException('Check your email address.');

        await this.tokenRepository.deleteById(user.id);
      }
    } else {
      const passwordEncrypted: string = await PasswordEncrypt.encrypt(userDTO.password);
      userDTO.password = passwordEncrypted;

      user = this.userRepository.create(userDTO);
      await this.userRepository.save(user);
    }

    const confirmToken: string = crypto.randomBytes(32).toString('hex');
    const hash: string = await PasswordEncrypt.encrypt(confirmToken);

    const token: Token = this.tokenRepository.create({ user, token: hash });
    await this.tokenRepository.save(token);

    const username: string = user.email.slice(0, user.email.indexOf('@'));
    const link: string = `${process.env.CLIENT_URL}/auth/confirm-email?token=${confirmToken}&id=${user.id}`;

    await EmailService.sendEmail(user.email, 'ReviewReveal: Confirm your email', { username, link }, './template/ConfirmEmail.hbs');
  }
}

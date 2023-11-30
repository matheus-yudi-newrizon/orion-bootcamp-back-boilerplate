import * as crypto from 'crypto';
import { Service } from 'typedi';
import { GameResponseDTO, LoginResponseDTO } from '../dto';
import { Game, Token, User } from '../entity';
import { AuthenticationFailedException, EntityNotFoundException, OperationFailException, PasswordChangeFailedException } from '../exception';
import { IUserPostRequest } from '../interface';
import { GameRepository, TokenRepository, UserRepository } from '../repository';
import { JwtService, PasswordEncrypt } from '../security';
import { EmailService } from '../utils/EmailService';

@Service()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly gameRepository: GameRepository
  ) {}

  /**
   * Performs user login with the provided user data.
   *
   * @param userDTO - The user data including email and password.
   *
   * @returns A promise that resolves with the login response, including an authentication token.
   * @throws {AuthenticationFailedException} if the email or password is incorrect.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async login(userDTO: IUserPostRequest): Promise<LoginResponseDTO> {
    const user: User = await this.userRepository.getByEmail(userDTO.email);
    if (!user || !user.isActive) throw new AuthenticationFailedException();

    const validPassword = await PasswordEncrypt.compare(userDTO.password, user.password);
    if (!validPassword) throw new AuthenticationFailedException();

    await this.userRepository.update(user.id, { loginCount: ++user.loginCount });

    const activeGame: Game = await this.gameRepository.getActiveGameByUser(user);
    const gameDTO: GameResponseDTO = activeGame ? new GameResponseDTO(activeGame, user) : null;

    const accessToken = JwtService.generateToken({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, '1h');

    return new LoginResponseDTO(accessToken, gameDTO);
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

    if (user?.isActive) {
      const oldToken: Token = await this.tokenRepository.findById(user.id);

      if (oldToken) {
        const expiresIn: number = oldToken.createdAt.getTime() + 1800000;
        const currentTime: number = new Date().getTime();

        if (expiresIn > currentTime) return;

        await this.tokenRepository.deleteById(user.id);
      }

      const resetToken: string = crypto.randomBytes(32).toString('hex');
      const hash: string = await PasswordEncrypt.encrypt(resetToken);

      const token: Token = this.tokenRepository.create({ user: user, token: hash });
      await this.tokenRepository.save(token);

      const username: string = user.email.slice(0, user.email.indexOf('@'));
      const link: string = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}&id=${user.id}`;

      await EmailService.sendEmail(user.email, 'ReviewReveal: Password Reset', { username, link }, './template/ForgotPassword.hbs');
    }
  }

  /**
   * Resets the user's password with a valid token.
   *
   * @param id - The id of the user resetting the password.
   * @param newPassword - The new password the user desires.
   * @param token - The token received via email.
   *
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   * @throws {EntityNotFoundException} if token was not found in database.
   * @throws {PasswordChangeFailedException} if password change fails.
   */
  public async resetPassword(id: number, newPassword: string, token: string): Promise<void> {
    const tokenById: Token = await this.tokenRepository.findById(id);
    if (!tokenById) throw new EntityNotFoundException('token');

    const expiresIn = tokenById.createdAt.getTime() + 1800000;
    const currentTime: number = new Date().getTime();

    const tokenValid = currentTime < expiresIn;
    const tokenMatch = await PasswordEncrypt.compare(token, tokenById.token);

    if (!tokenMatch || !tokenValid) throw new PasswordChangeFailedException();

    const newPasswordEncrypted: string = await PasswordEncrypt.encrypt(newPassword);

    await this.userRepository.update(id, { password: newPasswordEncrypted });
    await this.tokenRepository.deleteById(id);
  }

  /**
   * Confirm the user's email with a valid token.
   *
   * @param id - The id of the user confirming the email.
   * @param token - The token received via email.
   *
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   * @throws {EntityNotFoundException} if token was not found in database.
   * @throws {OperationFailException} if confirm email fails.
   */
  public async confirmEmail(id: number, token: string): Promise<void> {
    const tokenById: Token = await this.tokenRepository.findById(id);
    if (!tokenById) throw new EntityNotFoundException('token');

    const expiresIn = tokenById.createdAt.getTime() + 1800000;
    const currentTime: number = new Date().getTime();

    const tokenValid = currentTime < expiresIn;
    const tokenMatch = await PasswordEncrypt.compare(token, tokenById.token);

    if (!tokenMatch || !tokenValid) throw new OperationFailException('The token is not valid.');

    await this.userRepository.update(id, { isActive: true });
    await this.tokenRepository.deleteById(id);
  }
}

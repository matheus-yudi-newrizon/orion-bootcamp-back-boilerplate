import * as crypto from 'crypto';
import { Service } from 'typedi';
import { LoginResponseDTO } from '../dto/LoginResponseDTO';
import { Token } from '../entity/Token';
import { User } from '../entity/User';
import { AuthenticationFailedException } from '../exception/AuthenticationFailedException';
import { PasswordChangeFailedException } from '../exception/PasswordChangeFailedException';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { TokenRepository } from '../repository/TokenRepository';
import { UserRepository } from '../repository/UserRepository';
import { JwtService } from '../security/JwtService';
import { PasswordEncrypt } from '../security/PasswordEncrypt';
import { EmailService } from '../utils/EmailService';

@Service()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ) {}

  /**
   * Performs user login with the provided user data.
   *
   * @param userDTO - The user data including email and password.
   * @param rememberMe - A flag indicating whether the session should be remembered.
   *
   * @returns A promise that resolves with the login response, including an authentication token.
   * @throws {AuthenticationFailedException} if the email or password is incorrect.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async login(userDTO: IUserPostRequest, rememberMe: boolean): Promise<LoginResponseDTO> {
    const user: User = await this.userRepository.getByEmail(userDTO.email);
    if (!user) throw new AuthenticationFailedException();

    const validPassword = await PasswordEncrypt.compare(userDTO.password, user.password);
    if (!validPassword) throw new AuthenticationFailedException();

    const expiresIn = rememberMe ? undefined : '5h';
    const token = JwtService.generateToken({ id: user.id, email: user.email }, expiresIn);

    return new LoginResponseDTO(user, token);
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

      const token: Token = this.tokenRepository.create({ user: user, token: hash });
      await this.tokenRepository.save(token);

      const username: string = user.email.slice(0, user.email.indexOf('@'));
      const link: string = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}&id=${user.id}`;

      EmailService.sendEmail(user.email, 'ReviewReveal: Password Reset', { username: username, link: link }, './template/ForgotPassword.hbs');
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
   * @throws {PasswordChangeFailedException} if password change fails.
   */
  public async resetPassword(id: number, newPassword: string, token: string): Promise<void> {
    const tokenById: Token = await this.tokenRepository.findById(id);

    if (!tokenById) throw new PasswordChangeFailedException();

    const expiresIn = tokenById.createdAt.getTime() + 1800000;
    const currentTime: number = new Date().getTime();

    const tokenValid = currentTime < expiresIn;
    const tokenMatch = await PasswordEncrypt.compare(token, tokenById.token);

    if (!tokenMatch || !tokenValid) throw new PasswordChangeFailedException();

    const newPasswordEncrypted: string = await PasswordEncrypt.encrypt(newPassword);

    await this.userRepository.update(id, { password: newPasswordEncrypted });
    await this.tokenRepository.deleteById(id);
  }
}

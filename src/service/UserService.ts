import { Service } from 'typedi';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { Token } from '../entity/Token';
import { User } from '../entity/User';
import { InvalidJwtTokenException, UserAlreadyExistsException } from '../exception';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { TokenRepository } from '../repository/TokenRepository';
import { UserRepository } from '../repository/UserRepository';
import { PasswordEncrypt } from '../security/PasswordEncrypt';

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
   * Resets the user's password with a valid token.
   *
   * @param id - The id of the user resetting the password.
   * @param newPassword - The new password the user desires.
   * @param token - The token received via email.
   *
   * @returns A promise that resolves with the updated user.
   * @throws {InvalidJwtTokenException} if the token is invalid.
   */
  public async resetPassword(id: number, newPassword: string, token: string): Promise<void> {
    const tokenById: Token = await this.tokenRepository.findById(id);

    if (!tokenById) throw new Error('token nao existe');

    const expiresIn = tokenById.createdAt.getTime() + 1800000;
    const currentTime: number = new Date().getTime();

    const tokenValid = currentTime < expiresIn;
    const tokenMatch = PasswordEncrypt.compare(token, tokenById.token);

    if (!tokenMatch || !tokenValid) throw new Error('token invalido');

    const newPasswordEncrypted: string = await PasswordEncrypt.encrypt(newPassword);
    const user: User = tokenById.user;
    user.password = newPasswordEncrypted;
    await this.userRepository.save(user);

    await this.tokenRepository.deleteById(id);
  }
}

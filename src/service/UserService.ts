import { Service } from 'typedi';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { User } from '../entity/User';
import { UserAlreadyExistsException, UserNotFoundException } from '../exception';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { UserRepository } from '../repository/UserRepository';
import { PasswordEncrypt } from '../security/PasswordEncrypt';

@Service()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
   * Resets the password for a user with the provided email.
   *
   * @param email - The email of the user whose password needs to be reset.
   * @param newPassword - The new password for the user.
   * @param token - The token received from the email link.
   *
   * @returns A promise that resolves with the updated user.
   * @throws {UserNotFoundException} if the user with the provided email is not found.
   * @throws {InvalidJwtTokenException} if the token is invalid or expired.
   */
  public async resetPassword(email: string, newPassword: string, token: string): Promise<UserResponseDTO> {
    const user: User = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new UserNotFoundException(email);
    }
    if (!verifyToken(token)) {
      throw new InvalidJwtTokenException();
    }
    const newPasswordEncrypted: string = await PasswordEncrypt.encrypt(newPassword);
    user.password = newPasswordEncrypted;
    await this.userRepository.save(user);

    return new UserResponseDTO(user);
  }
}

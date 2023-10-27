import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { User } from '../entity/User';
import { PasswordEncrypt } from '../security/PasswordEncrypt';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { DatabaseOperationFailException, UserAlreadyExistsException } from '../exception';

export class UserService {
  private static userRepository: Repository<User> = MysqlDataSource.getRepository(User);

  /**
   * Creates a new user with the provided email and password. It ensures that
   * the password and the confirmation password match before creating the user.
   *
   * @param email - The user's email.
   * @param password - The user's password.
   *
   * @returns A promise that resolves with the created user.
   * @throws An error if the password and confirmation password do not match.
   */
  public static async createUser(email: string, password: string): Promise<UserResponseDTO> {
    const existsUserByEmail = await this.userRepository.findOne({ where: { email } });
    if (existsUserByEmail) throw new UserAlreadyExistsException(email);

    const passwordEncrypted = await PasswordEncrypt.encrypt(password);

    try {
      const user = await this.userRepository.save({ email, password: passwordEncrypted });
      return new UserResponseDTO(user);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

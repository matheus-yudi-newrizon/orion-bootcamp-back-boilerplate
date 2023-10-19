import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { User } from '../entity/User';

export class UserService {
  private static userRepository: Repository<User> =
    MysqlDataSource.getRepository(User);

  /**
   * Creates a new user with the provided email and password. It ensures that
   * the password and the confirmation password match before creating the user.
   *
   * @param email - The user's email.
   * @param password - The user's password.
   * @param confirmPassword - The password confirmation to ensure it matches the password.
   *
   * @returns A promise that resolves with the created user.
   * @throws An error if the password and confirmation password do not match.
   */
  public static async createUser(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<User> {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const usuario = new User();
    usuario.email = email;
    usuario.password = password;

    return this.userRepository.save(usuario);
  }
}

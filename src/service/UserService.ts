import { PasswordEncrypt } from '../security/PasswordEncrypt';
import { UserAlreadyExistsException } from '../exception/UserAlreadyExistsException';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { UserRepository } from '../repository/UserRepository';
import { UserPostRequestDTO } from '../dto/UserPostRequestDTO';

export class UserService {
  /**
   * Creates a new user with the provided email and password.
   *
   * @param userDTO - The user data including email and password.
   *
   * @returns A promise that resolves with the created user.
   * @throws {UserAlreadyExistsException} if the user already exists.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public static async createUser(userDTO: UserPostRequestDTO): Promise<UserResponseDTO> {
    const userByEmail = await UserRepository.getByEmail(userDTO.email);
    if (userByEmail) throw new UserAlreadyExistsException(userDTO.email);

    const passwordEncrypted = await PasswordEncrypt.encrypt(userDTO.password);
    userDTO.password = passwordEncrypted;

    const user = UserRepository.create(userDTO);
    await UserRepository.save(user);

    return new UserResponseDTO(user);
  }
}

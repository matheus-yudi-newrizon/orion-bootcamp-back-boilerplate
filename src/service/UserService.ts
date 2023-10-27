import { Service } from 'typedi';
import { UserPostRequestDTO } from '../dto/UserPostRequestDTO';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { User } from '../entity/User';
import { UserAlreadyExistsException } from '../exception';
import { UserRepository } from '../repository/UserRepository';
import { PasswordEncrypt } from '../security/PasswordEncrypt';

@Service()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user with the provided userDTO.
   *
   * @param userDTO - The user data including email and password.
   *
   * @returns A promise that resolves with the created user.
   * @throws {UserAlreadyExistsException} if the user already exists.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async createUser(userDTO: UserPostRequestDTO): Promise<UserResponseDTO> {
    const userByEmail: User = await this.userRepository.getByEmail(userDTO.email);
    if (userByEmail) throw new UserAlreadyExistsException(userDTO.email);

    const passwordEncrypted: string = await PasswordEncrypt.encrypt(userDTO.password);
    userDTO.password = passwordEncrypted;

    const user: User = this.userRepository.create(userDTO);
    await this.userRepository.save(user);

    return new UserResponseDTO(user);
  }
}

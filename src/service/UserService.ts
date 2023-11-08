import { Service } from 'typedi';
import { LoginResponseDTO } from '../dto/LoginResponseDTO';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { User } from '../entity/User';
import { UserAlreadyExistsException } from '../exception';
import { AuthenticationFailedException } from '../exception/AuthenticationFailedException';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { UserRepository } from '../repository/UserRepository';
import { JwtService } from '../security/JwtService';
import { PasswordEncrypt } from '../security/PasswordEncrypt';

@Service()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Creates a new user with the provided user data.
   *
   * @param userDTO - The user data including email and password.
   *
   * @returns A promise that resolves with the created user.
   * @throws {UserAlreadyExistsException} if the user already exists.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async createUser(userDTO: IUserPostRequest): Promise<UserResponseDTO> {
    const userByEmail: User = await this.userRepository.getByEmail(userDTO.email);
    if (userByEmail) throw new UserAlreadyExistsException(userDTO.email);

    const passwordEncrypted: string = await PasswordEncrypt.encrypt(userDTO.password);
    userDTO.password = passwordEncrypted;

    const user: User = this.userRepository.create(userDTO);
    await this.userRepository.save(user);

    return new UserResponseDTO(user);
  }

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
}

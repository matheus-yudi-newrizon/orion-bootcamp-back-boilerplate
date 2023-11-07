import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { User } from '../../src/entity/User';
import { IUserPostRequest } from '../../src/interface/IUserPostRequest';

export class Generate {
  /**
   * Generates a mock of sign up input.
   *
   * @returns An object with the mocked data.
   */
  public signUpInput() {
    const input = {
      email: 'orion@email.com',
      password: '12345678aA!',
      confirmPassword: '12345678aA!'
    };

    return input;
  }

  /**
   * Generates a mock of user post request.
   *
   * @returns A IUserPostRequest with the mocked data.
   */
  public userPostRequest(): IUserPostRequest {
    const { email, password } = this.signUpInput();
    const userPostRequest: IUserPostRequest = { email: email, password: password };

    return userPostRequest;
  }

  /**
   * Generates a mock of user data.
   *
   * @returns A User with the mocked data.
   */
  public userData(): User {
    const user: User = {
      id: 1,
      email: 'orion@email.com',
      password: '12345678aA!',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date()
    };

    return user;
  }

  /**
   * Generates a mock of user payload.
   *
   * @returns A UserResponseDTO with the mocked data.
   */
  public userPayload(): UserResponseDTO {
    const user: User = this.userData();

    return new UserResponseDTO(user);
  }

  /**
   * Generates a mock of forgot password input.
   *
   * @returns An object with the mocked data.
   */
  public forgotPasswordInput() {
    const user: User = this.userData();
    const input = {
      email: user.email
    };

    return input;
  }
}

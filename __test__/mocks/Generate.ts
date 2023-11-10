import { LoginResponseDTO } from '../../src/dto/LoginResponseDTO';
import { UserResponseDTO } from '../../src/dto/UserResponseDTO';
import { Token } from '../../src/entity/Token';
import { User } from '../../src/entity/User';
import { IUserPostRequest } from '../../src/interface/IUserPostRequest';

/**
 * Class for generating mock data for tests.
 */
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
   * Generates a mock of login input.
   *
   * @param rememberMe - A flag indicating whether the session should be remembered. Default is `false`.
   *
   * @returns An object with the mocked data.
   */
  public loginInput(rememberMe: boolean = false) {
    const { email, password } = this.userPostRequest();
    const input = { email, password, rememberMe };

    return input;
  }

  /**
   * Generates a mock of forgot password input.
   *
   * @returns An object with the mocked data.
   */
  public forgotPasswordInput() {
    const { email } = this.signUpInput();
    const input = { email };

    return input;
  }

  /**
   * Generates a mock of reset password input.
   *
   * @returns An object with the mocked data.
   */
  public resetPasswordInput() {
    const token: Token = this.tokenData();
    const newPassword: string = 'foo.BARZ%$#';

    const input = {
      token: token.token,
      id: token.id,
      password: newPassword,
      confirmPassword: newPassword
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
    const userPostRequest: IUserPostRequest = { email, password };

    return userPostRequest;
  }

  /**
   * Generates a mock of user data.
   *
   * @returns A User with the mocked data.
   */
  public userData(): User {
    const userPostRequest: IUserPostRequest = this.userPostRequest();

    const user: User = {
      id: 1,
      email: userPostRequest.email,
      password: userPostRequest.password,
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
   * Generates a mock of token data.
   *
   * @returns A Token with the mocked data.
   */
  public tokenData(): Token {
    const user = this.userData();

    const token: Token = {
      id: 1,
      user: user,
      token: 'abcde12345GHIJK!@#$%',
      createdAt: new Date()
    };

    return token;
  }

  /**
   * Generates a mock of expired token data.
   *
   * @returns A Token with the mocked data.
   */
  public expiredTokenData(): Token {
    const token: Token = this.tokenData();
    token.token = 'ABCDE!@#$%ghijkl12345';
    token.createdAt.setMinutes(token.createdAt.getMinutes() - 30);

    return token;
  }

  /**
   * Generates a mock of login response.
   *
   * @returns A LoginResponseDTO with the mocked data.
   */
  public loginResponse(): LoginResponseDTO {
    const user: User = this.userData();
    const jwt: string = this.encodedJwt();
    const loginReponse: LoginResponseDTO = new LoginResponseDTO(user, jwt);

    return loginReponse;
  }

  /**
   * Generates a mock of encoded JWT data.
   *
   * @returns A string with the mocked data.
   */
  public encodedJwt(): string {
    const jwt: string =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    return jwt;
  }

  /**
   * Generates a mock of hashed password.
   *
   * @returns A string with the mocked data.
   */
  public hashedPassword(): string {
    const hashed: string = 'ABCDEF!@#$%iuojk_>,abc';

    return hashed;
  }
}

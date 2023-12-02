import { GameResponseDTO, LoginResponseDTO, UserResponseDTO } from '../../src/dto';
import { Game, Token, User } from '../../src/entity';
import { IUserPostRequest } from '../../src/interface';

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
   * @param rememberMe - A flag indicating whether the session should be remembered. Default is `true`.
   *
   * @returns An object with the mocked data.
   */
  public loginInput(rememberMe: boolean = true) {
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
   * @param isActive - A flag indicating whether the user is active or not. Default is `true`.
   *
   * @returns A User with the mocked data.
   */
  public userData(isActive: boolean = true): User {
    const userPostRequest: IUserPostRequest = this.userPostRequest();

    const user: User = {
      id: 1,
      email: userPostRequest.email,
      password: userPostRequest.password,
      loginCount: 0,
      playCount: 0,
      record: 0,
      isActive,
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
      user,
      token: 'b55ea11ca19f9674b6a5d60d6c098c6d511e8bdf7de9571a8dfd5e6b56e7ec22',
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
    token.token = 'ecd2fab5db8aace30e1211a82114b6e214bb8dd302e375c857fcd99cc1d4269a';
    token.createdAt.setMinutes(token.createdAt.getMinutes() - 30);

    return token;
  }

  /**
   * Generates a mock of login response.
   *
   * @returns A LoginResponseDTO with the mocked data.
   */
  public loginResponse(): LoginResponseDTO {
    const jwt: string = this.encodedJwt();
    const game: Game = this.newGame();
    const user: User = this.userData();
    const loginReponse: LoginResponseDTO = new LoginResponseDTO(jwt, new GameResponseDTO(game, user));

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
    const hashed: string = 'YkVD2BxmDUCZcJW4e9zFiOEzgSAPk63gdOnC1yt3YefrGT5yStqYG';

    return hashed;
  }

  /**
   * Generates a mock of new game.
   *
   * @returns A Game with the mocked data.
   */
  public newGame(): Game {
    const user: User = this.userData();
    const game: Game = {
      id: 1,
      user,
      lives: 2,
      score: 0,
      combo: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      gameReviews: [],
      currentGameReview: null
    };

    return game;
  }
}

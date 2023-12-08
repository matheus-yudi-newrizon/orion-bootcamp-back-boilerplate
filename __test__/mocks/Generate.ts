import { GameResponseDTO, GameReviewResponseDTO, LoginResponseDTO, MovieDTO, ReviewDTO, UserResponseDTO } from '../../src/dto';
import { Game, GameReview, Movie, Review, Token, User } from '../../src/entity';
import { IGameAnswerRequest, IUserPostRequest } from '../../src/interface';

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
   * Generates a mock of confirm email input.
   *
   * @returns An object with the mocked data.
   */
  public confirmEmailInput() {
    const token: Token = this.tokenData();

    const input = {
      id: token.id,
      token: token.token
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
   * Generates a mock of send answer request.
   *
   * @returns A IGameAnswerRequest with the mocked data.
   */
  public gameAnswerRequest(): IGameAnswerRequest {
    const gameAnswerRequest: IGameAnswerRequest = {
      answer: 22
    };

    return gameAnswerRequest;
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
    const token: Token = {
      id: 1,
      user: null,
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
    const game: Game = this.gameData();
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
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvcmlvbkBlbWFpbC5jb20ifQ.q6QO9j1G4VlfKx2pPqH5uJ5Egrdv6c6--LjGBI4vliQ';

    return jwt;
  }

  /**
   * Generates a mock of encoded JWT data.
   *
   * @returns A string with the mocked data.
   */
  public cookieData(): string {
    const jwt: string = this.encodedJwt();
    const cookie: string = `refreshToken=${jwt}; Path=/; HttpOnly; SameSite=Strict; Domain=localhost`;

    return cookie;
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
   * @param score - A number indicating the game score. Default is `0`.
   * @param combo - A number indicating the current combo. Default is `0`.
   *
   * @returns A Game with the mocked data.
   */
  public gameData(score: number = 0, combo: number = 0): Game {
    const user: User = this.userData();
    const game: Game = {
      id: 1,
      user,
      lives: 2,
      score,
      combo,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      gameReviews: [],
      currentGameReview: null
    };

    return game;
  }

  /**
   * Generates a mock of review.
   *
   * @returns A Review with the mocked data.
   */
  public reviewData(): Review {
    const movie: Movie = this.movieData();
    const review: Review = {
      id: '5424a49ec3a3681eca002c23',
      text: 'Ah, but you have heard of me. The crew of the Black Pearl are cursed by something most unimaginable, the only way to lift the curse is to return a lost Aztec coin to its treasure chest home. That is a shame, but at the very least we still have this wonderful picture to go back to time and time again, to lift you up when one is down or to keep one happy when one is already in that happy place. The Curse Of The Black Pearl is a joy from start to finish. 9/10',
      author: 'John Chard',
      movie,
      gameReviews: []
    };

    return review;
  }

  /**
   * Generates a mock of movie.
   *
   * @returns A Movie with the mocked data.
   */
  public movieData(): Movie {
    const movie: Movie = {
      id: 22,
      imdbId: 'tt0325980',
      title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
      posterPath: '/z8onk7LV9Mmw6zKz4hT6pzzvmvl.jpg',
      releaseDate: new Date('2003-07-09 00:00:00'),
      reviews: []
    };

    return movie;
  }

  /**
   * Generates a mock of game review answered.
   *
   * @returns A GameReview with the mocked data.
   */
  public gameReviewData(): GameReview {
    const game: Game = this.gameData();
    const review: Review = this.reviewData();

    const gameReview: GameReview = {
      id: 1,
      game,
      review,
      answer: null,
      isCorrect: null,
      createdAt: new Date()
    };
    gameReview.game.currentGameReview = gameReview;

    return gameReview;
  }

  /**
   * Generates a mock of movie response DTO.
   *
   * @returns A MovieDTO with the mocked data.
   */
  public movieResponse(): MovieDTO {
    const movie: Movie = this.movieData();

    return new MovieDTO(movie);
  }

  /**
   * Generates a mock of game response DTO.
   *
   * @returns A GameResponseDTO with the mocked data.
   */
  public gameResponse(): GameResponseDTO {
    const game: Game = this.gameData();

    return new GameResponseDTO(game, game.user);
  }

  /**
   * Generates a mock of game review response DTO.
   *
   * @returns A GameReviewResponseDTO with the mocked data.
   */
  gameReviewResponse(): GameReviewResponseDTO {
    const gameReview: GameReview = this.gameReviewData();
    const game: GameResponseDTO = this.gameResponse();

    return new GameReviewResponseDTO(gameReview, game);
  }

  /**
   * Generates a mock of review response DTO.
   *
   * @returns A ReviewDTO with the mocked data.
   */
  public reviewResponse(): ReviewDTO {
    const review: Review = this.reviewData();

    return new ReviewDTO(review);
  }
}

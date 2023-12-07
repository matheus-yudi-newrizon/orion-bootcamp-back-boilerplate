import { Service } from 'typedi';
import { GameResponseDTO, GameReviewResponseDTO } from '../dto';
import { Game, GameReview, User } from '../entity';
import { EntityNotFoundException, GameIsActiveException } from '../exception';
import { IGameAnswerRequest } from '../interface';
import { GameRepository, GameReviewRepository, UserRepository } from '../repository';

@Service()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
    private readonly gameReviewRepository: GameReviewRepository
  ) {}

  /**
   * Creates a new game with the provided user id.
   *
   * @param userId - The id of the user that requested a new game.
   *
   * @returns A promise that resolves with the created game.
   * @throws {EntityNotFoundException} if the user was not found in database.
   * @throws {GameIsActiveException} if the user has an active game.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async createGame(userId: number): Promise<GameResponseDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new EntityNotFoundException('user');

    const gameByUser: Game = await this.gameRepository.getActiveGameByUser(user);
    if (gameByUser) throw new GameIsActiveException();

    await this.userRepository.update(user.id, { playCount: ++user.playCount });

    const game: Game = this.gameRepository.create({ user: user, lives: 2, score: 0, combo: 0, isActive: true });
    await this.gameRepository.save(game);

    return new GameResponseDTO(game, user);
  }

  /**
   * Saves the game answer and updates the game status for the provided user id.
   *
   * @param gameAnswerRequest - The data of the answer request.
   * @param userId - The id of the user that sent the request.
   *
   * @returns A promise that resolves with the game updated data.
   * @throws {EntityNotFoundException} if the user, game or review was not found in database.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async sendAnswer(gameAnswerRequest: IGameAnswerRequest, userId: number): Promise<GameReviewResponseDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new EntityNotFoundException('user');

    const game: Game = await this.gameRepository.getActiveGameByUser(user);
    if (!game) throw new EntityNotFoundException('game');

    const gameReview: GameReview = game.currentGameReview;
    if (!gameReview) throw new EntityNotFoundException('game review');

    gameReview.answer = gameAnswerRequest.answer;
    gameReview.isCorrect = gameReview.answer === gameReview.review.movie.id;
    await this.gameReviewRepository.update(gameReview.id, gameReview);

    if (gameReview.isCorrect) {
      game.combo += 1;
      game.score += 1;

      if (game.combo % 3 === 0 && game.lives < 5) {
        game.lives += 1;
      }

      if (game.score > user.record) {
        user.record = game.score;
      }
    } else {
      game.combo = 0;
      game.lives -= 1;
      game.isActive = game.lives > 0;
    }

    user.guessCount++;
    game.currentGameReview = null;
    await this.gameRepository.update(game.id, game);
    await this.userRepository.update(user.id, user);

    return new GameReviewResponseDTO(gameReview, new GameResponseDTO(game, user));
  }
}

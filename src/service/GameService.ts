import { Service } from 'typedi';
import { GameReviewResponseDTO } from '../dto/GameReviewResponseDTO';
import { GameResponseDTO } from '../dto/GameResponseDTO';
import { Game } from '../entity/Game';
import { GameReview } from '../entity/GameReview';
import { Review } from '../entity/Review';
import { User } from '../entity/User';
import { EntityNotFoundException } from '../exception/EntityNotFoundException';
import { GameIsActiveException } from '../exception/GameIsActiveException';
import { IGameAnswerRequest } from '../interface/IGameAnswerRequest';
import { GameRepository } from '../repository/GameRepository';
import { GameReviewRepository } from '../repository/GameReviewRepository';
import { ReviewRepository } from '../repository/ReviewRepository';
import { UserRepository } from '../repository/UserRepository';

@Service()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
    private readonly reviewRepository: ReviewRepository,
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

    const review: Review = await this.reviewRepository.getById(gameAnswerRequest.reviewId);
    if (!review) throw new EntityNotFoundException('review');

    const gameReview: GameReview = game.currentGameReview;
    gameReview.answer = gameAnswerRequest.answer;
    gameReview.isCorrect = gameAnswerRequest.answer === review.movie.title;
    await this.gameReviewRepository.update(gameReview.id, gameReview);

    if (gameReview.isCorrect) {
      game.combo += 1;
      game.score += 1;

      if (game.combo % 10 === 0 && game.lives < 5) {
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

    game.currentGameReview = null;
    await this.gameRepository.update(game.id, game);
    await this.userRepository.update(user.id, user);

    return new GameReviewResponseDTO(gameReview, new GameResponseDTO(game, user));
  }
}

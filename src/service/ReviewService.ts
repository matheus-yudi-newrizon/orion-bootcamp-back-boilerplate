import { Service } from 'typedi';
import { ReviewDTO } from '../dto';
import { Game, GameReview, Movie, Review, User } from '../entity';
import { EntityNotFoundException } from '../exception';
import { GameRepository, GameReviewRepository, ReviewRepository, UserRepository } from '../repository';

@Service()
export class ReviewService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly gameReviewRepository: GameReviewRepository
  ) {}

  /**
   * Gets a random review.
   *
   * @param userId - The id of the user that requested a new review.
   *
   * @returns A promise that resolves with a review.
   * @throws {EntityNotFoundException} if the user or game was not found in database.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async getReview(userId: number): Promise<ReviewDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new EntityNotFoundException('user');

    const game: Game = await this.gameRepository.getActiveGameByUser(user);
    if (!game) throw new EntityNotFoundException('game');

    if (!game.currentGameReview) {
      const randomReview: Review = await this.getRandomReviewValid(game);

      const gameReview: GameReview = this.createGameReview(game, randomReview);
      await this.gameReviewRepository.save(gameReview);

      game.currentGameReview = gameReview;
      await this.gameRepository.update(game.id, game);
    }

    const movie: Movie = game.currentGameReview.review.movie;
    console.log(`\nCurrent review title: ${movie.title} ${movie.releaseDate.getFullYear()}`);

    return new ReviewDTO(game.currentGameReview.review);
  }

  /**
   * Fetches a random valid review not already in the game's review list.
   *
   * @param game - The Game entity.
   * @returns A Promise resolving with a Review.
   */
  private async getRandomReviewValid(game: Game): Promise<Review> {
    const gameReviews: GameReview[] = await this.gameReviewRepository.getByGame(game);

    let randomReview: Review;
    do {
      randomReview = await this.reviewRepository.getRandomReview();
    } while (gameReviews.some(gameReview => gameReview.review.id === randomReview.id));

    return randomReview;
  }

  /**
   * Creates a new GameReview entity based on the provided Game and Review entities.
   *
   * @param game - The Game entity.
   * @param randomReview - The Review entity.
   * @returns A new GameReview entity.
   */
  private createGameReview(game: Game, randomReview: Review): GameReview {
    return this.gameReviewRepository.create({
      game,
      review: randomReview,
      answer: null,
      isCorrect: null
    });
  }
}

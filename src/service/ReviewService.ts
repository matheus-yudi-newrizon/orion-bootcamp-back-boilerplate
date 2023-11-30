import { Service } from 'typedi';
import { ReviewDTO } from '../dto/ReviewDTO';
import { Game } from '../entity/Game';
import { GameReview } from '../entity/GameReview';
import { Review } from '../entity/Review';
import { User } from '../entity/User';
import { EntityNotFoundException } from '../exception/EntityNotFoundException';
import { GameRepository } from '../repository/GameRepository';
import { GameReviewRepository } from '../repository/GameReviewRepository';
import { ReviewRepository } from '../repository/ReviewRepository';
import { UserRepository } from '../repository/UserRepository';

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

    if (game.currentGameReview === null) {
      const randomReview: Review = await this.getRandomReviewValid(game);

      const gameReview: GameReview = this.createGameReview(game, randomReview);
      await this.gameReviewRepository.save(gameReview);

      game.currentGameReview = gameReview;
      await this.gameRepository.update(game.id, game);
    }

    const review: Review = await this.getReviewById(game.currentGameReview.review.id);
    console.log('\nCurrent review tittle: ', review.movie.title);

    return new ReviewDTO(review);
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
      game: game,
      review: randomReview,
      answer: null,
      isCorrect: null
    });
  }

  /**
   * Retrieves a Review entity based on the provided review identifier.
   *
   * @param reviewId - The identifier of the review.
   * @returns A Promise resolving with a Review entity.
   * @throws {EntityNotFoundException} if the review is not found in the database.
   */
  private async getReviewById(reviewId: string): Promise<Review> {
    const review: Review = await this.reviewRepository.getById(reviewId);
    if (!review) throw new EntityNotFoundException('review');
    return review;
  }
}

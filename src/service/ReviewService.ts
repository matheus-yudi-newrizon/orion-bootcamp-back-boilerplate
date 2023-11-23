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

    const gameReviews: GameReview[] = await this.gameReviewRepository.getByGame(game);
    let review: Review;

    do {
      review = await this.reviewRepository.getRandomReview();
    } while (gameReviews.some(gameReview => gameReview.review.id === review.id));

    return new ReviewDTO(review);
  }
}

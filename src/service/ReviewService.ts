import { Service } from 'typedi';
import { ReviewDTO } from '../dto/ReviewDTO';
import { Game } from '../entity/Game';
import { GameReview } from '../entity/GameReview';
import { Review } from '../entity/Review';
import { User } from '../entity/User';
import { GameNotFoundException } from '../exception/GameNotFoundException';
import { UserNotFoundException } from '../exception/UserNotFoundException';
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
   * @throws {UserNotFoundException} if the user was not found in database.
   * @throws {GameNotFoundException} if the active game was not found in database.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async getReview(userId: number): Promise<ReviewDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new UserNotFoundException();

    const game: Game = await this.gameRepository.getActiveGameByUser(user);
    if (!game) throw new GameNotFoundException();

    const gameReviews: GameReview[] = await this.gameReviewRepository.getByGame(game);
    let isRepeated: boolean;
    let review: Review;

    do {
      isRepeated = false;
      review = await this.reviewRepository.getRandomReview();

      for (const gameReview of gameReviews) {
        if (gameReview.review.id === review.id) {
          isRepeated = true;
          break;
        }
      }
    } while (isRepeated);

    return new ReviewDTO(review);
  }
}

import { Container } from 'typedi';
import { UpdateResult } from 'typeorm';
import { GameResponseDTO, GameReviewResponseDTO, ReviewDTO, UserResponseDTO } from '../../src/dto';
import { Game, GameReview, Review, User } from '../../src/entity';
import { DatabaseOperationFailException, EntityNotFoundException, GameIsActiveException } from '../../src/exception';
import { IGameAnswerRequest } from '../../src/interface';
import { GameRepository, GameReviewRepository, ReviewRepository, UserRepository } from '../../src/repository';
import { GameService, ReviewService } from '../../src/service';
import { Generate } from '../mocks/Generate';

const reviewService = Container.get(ReviewService);
const reviewRepository = Container.get(ReviewRepository);
const userRepository = Container.get(UserRepository);
const gameRepository = Container.get(GameRepository);
const gameReviewRepository = Container.get(GameReviewRepository);

const generate = new Generate();

describe('ReviewService', () => {
  describe('getReview', () => {
    it('should return a random review', async () => {
      const game: Game = generate.gameData();
      const user: User = generate.userData();
      const review: Review = generate.reviewData();
      const gameReview: GameReview = generate.gameReviewData();
      const gameReviewList: GameReview[] = [];

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);

      const spyGetByGame = jest.spyOn(gameReviewRepository, 'getByGame').mockReturnValue(Promise.resolve(gameReviewList));
      const spyRandomReview = jest.spyOn(reviewRepository, 'getRandomReview').mockResolvedValue(review);

      const spyCreate = jest.spyOn(gameReviewRepository, 'create').mockReturnValue(gameReview);
      const spySave = jest.spyOn(gameReviewRepository, 'save').mockReturnValue(Promise.resolve(gameReview));

      const spyUpdate = jest.spyOn(gameRepository, 'update').mockResolvedValue(new UpdateResult());

      const result: ReviewDTO = await reviewService.getReview(user.id);

      expect(result).toEqual(generate.reviewResponse());
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyGetByGame).toHaveBeenCalledWith(game);
      expect(spyRandomReview).toHaveBeenCalled();
      expect(spyCreate).toHaveBeenCalledWith({ game, review, answer: null, isCorrect: null });
      expect(spySave).toHaveBeenCalledWith(gameReview);
      expect(spyUpdate).toHaveBeenCalledWith(game.id, game);
    });

    it('should throw EntityNotFoundException if the user was not found', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(null);

      await expect(reviewService.getReview(user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
    });

    it('should throw EntityNotFoundException if the user does not have an active game', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);

      await expect(reviewService.getReview(user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });
  });
});

import { Container } from 'typedi';
import { UpdateResult } from 'typeorm';
import { GameResponseDTO, GameReviewResponseDTO, UserResponseDTO } from '../../src/dto';
import { Game, GameReview, User } from '../../src/entity';
import { DatabaseOperationFailException, EntityNotFoundException, GameIsActiveException } from '../../src/exception';
import { IGameAnswerRequest } from '../../src/interface';
import { GameRepository, GameReviewRepository, UserRepository } from '../../src/repository';
import { GameService } from '../../src/service';
import { Generate } from '../mocks/Generate';

const gameService = Container.get(GameService);
const userRepository = Container.get(UserRepository);
const gameRepository = Container.get(GameRepository);
const gameReviewRepository = Container.get(GameReviewRepository);

const generate = new Generate();

describe('GameService', () => {
  describe('createGame', () => {
    it('should return the created game', async () => {
      const game: Game = generate.gameData();
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyCreate = jest.spyOn(gameRepository, 'create').mockReturnValue(game);
      const spySave = jest.spyOn(gameRepository, 'save').mockResolvedValue(game);

      const result: GameResponseDTO = await gameService.createGame(user.id);

      expect(result).toEqual(generate.gameResponse());
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { playCount: user.playCount++ });
      expect(spyCreate).toHaveBeenCalledWith({ user, lives: 2, score: 0, combo: 0, isActive: true });
      expect(spySave).toHaveBeenCalledWith(game);
    });

    it('should throw EntityNotFoundException if the user was not found', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(null);

      await expect(gameService.createGame(user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
    });

    it('should throw GameIsActiveException if the user has an active game', async () => {
      const user: User = generate.userData();
      const game: Game = generate.gameData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);

      await expect(gameService.createGame(user.id)).rejects.toThrow(GameIsActiveException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw DatabaseOperationFailException if there is a failure updating user', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.createGame(user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { playCount: user.playCount++ });
    });

    it('should throw DatabaseOperationFailException if there is a failure creating game', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyCreate = jest.spyOn(gameRepository, 'create').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.createGame(user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { playCount: user.playCount++ });
      expect(spyCreate).toHaveBeenCalledWith({ user, lives: 2, score: 0, combo: 0, isActive: true });
    });

    it('should throw DatabaseOperationFailException if there is a failure saving game', async () => {
      const game: Game = generate.gameData();
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);
      const spyUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyCreate = jest.spyOn(gameRepository, 'create').mockReturnValue(game);
      const spySave = jest.spyOn(gameRepository, 'save').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.createGame(user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyUpdate).toHaveBeenCalledWith(user.id, { playCount: user.playCount++ });
      expect(spyCreate).toHaveBeenCalledWith({ user, lives: 2, score: 0, combo: 0, isActive: true });
      expect(spySave).toHaveBeenCalledWith(game);
    });
  });

  describe('sendAnswer', () => {
    it('should return the game updated data when answer is correct', async () => {
      const gameReview: GameReview = generate.gameReviewData();
      const user: User = generate.userData();
      const game: Game = generate.gameData(5, 12);
      game.currentGameReview = gameReview;

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGameReviewUpdate = jest.spyOn(gameReviewRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGameUpdate = jest.spyOn(gameRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyUserUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());

      const gameReviewResponse: GameReviewResponseDTO = await gameService.sendAnswer(generate.gameAnswerRequest(), user.id);

      expect(gameReviewResponse.isCorrect).toBe(true);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyGameReviewUpdate).toHaveBeenCalledWith(gameReview.id, gameReview);
      expect(spyGameUpdate).toHaveBeenCalledWith(game.id, game);
      expect(spyUserUpdate).toHaveBeenCalledWith(user.id, user);
    });

    it('should return the game updated data when answer is not correct', async () => {
      const gameReview: GameReview = generate.gameReviewData();
      const user: User = generate.userData();
      const game: Game = generate.gameData(8, 10);
      game.currentGameReview = gameReview;
      const gameAnswerRequest: IGameAnswerRequest = generate.gameAnswerRequest();
      gameAnswerRequest.answer = 2;

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGameReviewUpdate = jest.spyOn(gameReviewRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGameUpdate = jest.spyOn(gameRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyUserUpdate = jest.spyOn(userRepository, 'update').mockResolvedValue(new UpdateResult());

      const gameReviewResponse: GameReviewResponseDTO = await gameService.sendAnswer(gameAnswerRequest, user.id);

      expect(gameReviewResponse.isCorrect).toBe(false);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
      expect(spyGameReviewUpdate).toHaveBeenCalledWith(gameReview.id, gameReview);
      expect(spyGameUpdate).toHaveBeenCalledWith(game.id, game);
      expect(spyUserUpdate).toHaveBeenCalledWith(user.id, user);
    });

    it('should throw EntityNotFoundException for game review', async () => {
      const user: User = generate.userData();
      const game: Game = generate.gameData(8, 40);

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw EntityNotFoundException for game', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(null);

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw EntityNotFoundException for user', async () => {
      const user: UserResponseDTO = generate.userPayload();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(null);

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(EntityNotFoundException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
    });

    it('should throw DatabaseOperationFailException when fails updating user', async () => {
      const gameReview: GameReview = generate.gameReviewData();
      const user: User = generate.userData();
      const game: Game = generate.gameData(5, 12);
      game.currentGameReview = gameReview;

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGameReviewUpdate = jest.spyOn(gameReviewRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGameUpdate = jest.spyOn(gameRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyUserUpdate = jest.spyOn(userRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);

      gameReview.isCorrect = true;
      expect(spyGameReviewUpdate).toHaveBeenCalledWith(gameReview.id, gameReview);

      game.combo += 1;
      game.score += 1;
      game.lives += 1;
      user.record = game.score;
      game.currentGameReview = null;
      expect(spyGameUpdate).toHaveBeenCalledWith(game.id, game);
      expect(spyUserUpdate).toHaveBeenCalledWith(user.id, user);
    });

    it('should throw DatabaseOperationFailException when fails updating game', async () => {
      const gameReview: GameReview = generate.gameReviewData();
      const user: User = generate.userData();
      const game: Game = generate.gameData(5, 12);
      game.currentGameReview = gameReview;

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGameReviewUpdate = jest.spyOn(gameReviewRepository, 'update').mockResolvedValue(new UpdateResult());
      const spyGameUpdate = jest.spyOn(gameRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);

      gameReview.isCorrect = true;
      expect(spyGameReviewUpdate).toHaveBeenCalledWith(gameReview.id, gameReview);

      game.combo += 1;
      game.score += 1;
      game.lives += 1;
      user.record = game.score;
      game.currentGameReview = null;
      expect(spyGameUpdate).toHaveBeenCalledWith(game.id, game);
    });

    it('should throw DatabaseOperationFailException when fails updating game review', async () => {
      const gameReview: GameReview = generate.gameReviewData();
      const user: User = generate.userData();
      const game: Game = generate.gameData(5, 12);
      game.currentGameReview = gameReview;

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockResolvedValue(game);
      const spyGameReviewUpdate = jest.spyOn(gameReviewRepository, 'update').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);

      gameReview.isCorrect = true;
      expect(spyGameReviewUpdate).toHaveBeenCalledWith(gameReview.id, gameReview);
    });

    it('should throw DatabaseOperationFailException when fails getting active game', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockResolvedValue(user);
      const spyGameByUser = jest.spyOn(gameRepository, 'getActiveGameByUser').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
      expect(spyGameByUser).toHaveBeenCalledWith(user);
    });

    it('should throw DatabaseOperationFailException when fails getting user', async () => {
      const user: User = generate.userData();

      const spyGetById = jest.spyOn(userRepository, 'getById').mockImplementation(() => {
        throw new DatabaseOperationFailException();
      });

      await expect(gameService.sendAnswer(generate.gameAnswerRequest(), user.id)).rejects.toThrow(DatabaseOperationFailException);
      expect(spyGetById).toHaveBeenCalledWith(user.id);
    });
  });
});

import { Service } from 'typedi';
import { GameResponseDTO } from '../dto/GameResponseDTO';
import { Game } from '../entity/Game';
import { User } from '../entity/User';
import { GameIsActiveException } from '../exception/GameIsActiveException';
import { UserNotFoundException } from '../exception/UserNotFoundException';
import { GameRepository } from '../repository/GameRepository';
import { UserRepository } from '../repository/UserRepository';

@Service()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Creates a new game with the provided user id.
   *
   * @param userId - The id of the user that requested a new game.
   *
   * @returns A promise that resolves with the created game.
   * @throws {JsonWebTokenError} if the user was not found in database.
   * @throws {GameIsActiveException} if the user has an active game.
   * @throws {DatabaseOperationFailException} if there is a database operation failure.
   */
  public async createGame(userId: number): Promise<GameResponseDTO> {
    const user: User = await this.userRepository.getById(userId);
    if (!user) throw new UserNotFoundException();

    const gameByUserId: Game = await this.gameRepository.getActiveGameByUser(user);
    if (gameByUserId) throw new GameIsActiveException();

    const game: Game = this.gameRepository.create({ user: user, lives: 5, score: 0, combo: 0, isActive: true });
    await this.gameRepository.save(game);

    return new GameResponseDTO(game);
  }
}

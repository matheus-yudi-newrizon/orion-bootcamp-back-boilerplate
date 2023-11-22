import { Service as Repository } from 'typedi';
import { DeepPartial, Repository as TypeOrmRepository, UpdateResult } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Game } from '../entity/Game';
import { User } from '../entity/User';
import { DatabaseOperationFailException } from '../exception';

@Repository()
export class GameRepository {
  private ormRepository: TypeOrmRepository<Game> = MysqlDataSource.getRepository(Game);

  /**
   * Saves a given game in the database.
   * If game does not exist in the database then inserts, otherwise updates.
   *
   * @param game - The game entity to be saved or updated.
   *
   * @returns A promise that resolves with the saved or updated game.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async save(game: Game): Promise<Game> {
    try {
      return await this.ormRepository.save(game);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Retrieves a game in the database by a given user.
   *
   * @param user - The user entity to use in the query.
   *
   * @returns A promise that resolves with the retrieved game or null if not found.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getActiveGameByUser(user: User): Promise<Game | null> {
    try {
      return await this.ormRepository.findOne({
        where: {
          user: { id: user.id },
          isActive: true
        }
      });
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Creates a new game instance and copies all game properties from this object into a new game.
   * Note that it copies only properties that are present in game schema.
   *
   * @param entityLike - An object containing properties to be copied into a new game instance.
   *
   * @returns A new game instance with copied properties.
   * @throws {DatabaseOperationFailException} If the operation fails.
   */
  public create(entityLike: DeepPartial<Game>): Game {
    try {
      return this.ormRepository.create(entityLike);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Updates a game by id with the given data.
   *
   * @param id - The id of the game to update.
   * @param gameData - The data to update.
   *
   * @returns A promise that resolves with the update result.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async update(id: number, gameData: DeepPartial<Game>): Promise<UpdateResult> {
    try {
      return await this.ormRepository.update(id, gameData);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

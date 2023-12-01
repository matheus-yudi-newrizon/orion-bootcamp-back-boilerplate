import { Service as Repository } from 'typedi';
import { DeepPartial, Repository as TypeOrmRepository, UpdateResult } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Game, GameReview } from '../entity';
import { DatabaseOperationFailException } from '../exception';

@Repository()
export class GameReviewRepository {
  private ormRepository: TypeOrmRepository<GameReview> = MysqlDataSource.getRepository(GameReview);

  /**
   * Retrieves all game reviews in the database by the provided game.
   *
   * @param game - The game entity to use in the query.
   *
   * @returns A promise that resolves with the retrieved game reviews.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getByGame(game: Game): Promise<GameReview[]> {
    try {
      return await this.ormRepository
        .createQueryBuilder('gameReview')
        .leftJoinAndSelect('gameReview.game', 'game')
        .leftJoinAndSelect('gameReview.review', 'review')
        .where('gameReview.gameId = :id', { id: game.id })
        .getMany();
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Saves a given game review in the database.
   * If game review does not exist in the database then inserts, otherwise updates.
   *
   * @param gameReview - The GameReview entity to be saved or updated.
   *
   * @returns A promise that resolves with the saved or updated game review.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async save(gameReview: GameReview): Promise<GameReview> {
    try {
      return await this.ormRepository.save(gameReview);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Creates a new game review instance and copies all game review properties from this object into a new one.
   * Note that it copies only properties that are present in GameReview schema.
   *
   * @param entityLike - An object containing properties to be copied into a new GameReview instance.
   *
   * @returns A new GameReview instance with copied properties.
   * @throws {DatabaseOperationFailException} If the operation fails.
   */
  public create(entityLike: DeepPartial<GameReview>): GameReview {
    try {
      return this.ormRepository.create(entityLike);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Updates a gameReview by id with the given data.
   *
   * @param id - The id of the gameReview to update.
   * @param gameReviewData - The data to update.
   *
   * @returns A promise that resolves with the update result.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async update(id: number, gameReviewData: DeepPartial<GameReview>): Promise<UpdateResult> {
    try {
      return await this.ormRepository.update(id, gameReviewData);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

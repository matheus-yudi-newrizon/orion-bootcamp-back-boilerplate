import { Service as Repository } from 'typedi';
import { Repository as TypeOrmRepository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Game } from '../entity/Game';
import { GameReview } from '../entity/GameReview';
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
}

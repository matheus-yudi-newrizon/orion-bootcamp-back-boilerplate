import { Service as Repository } from 'typedi';
import { Repository as TypeOrmRepository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Review } from '../entity/Review';
import { DatabaseOperationFailException } from '../exception';

@Repository()
export class ReviewRepository {
  private ormRepository: TypeOrmRepository<Review> = MysqlDataSource.getRepository(Review);

  /**
   * Retrieves a random review in the database.
   *
   * @returns A promise that resolves with the retrieved review.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getRandomReview(): Promise<Review> {
    try {
      return await this.ormRepository.createQueryBuilder('review').select().orderBy('RAND()').getOne();
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

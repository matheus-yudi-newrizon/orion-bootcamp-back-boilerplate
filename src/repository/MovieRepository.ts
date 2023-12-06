import { Service as Repository } from 'typedi';
import { Like, Repository as TypeOrmRepository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Movie } from '../entity';
import { DatabaseOperationFailException } from '../exception';
import { FindOneOptions } from 'typeorm';
import { EntityNotFoundException } from '../exception';

@Repository()
export class MovieRepository {
  private ormRepository: TypeOrmRepository<Movie> = MysqlDataSource.getRepository(Movie);

  /**
   * Finds movies by a given title.
   * If movie was not found in the database - returns null.
   *
   * @param title - The title of the movie to retrieve.
   *
   * @returns A promise that resolves with the movie if found; otherwise, null.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getByTitle(title: string): Promise<Movie[] | null> {
    try {
      return await this.ormRepository.find({
        where: {
          title: Like(`${title}%`)
        },
        take: 5
      });
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Finds movies by a given id.
   * If movie was not found in the database - returns null.
   *
   * @param id - The id of the movie to retrieve.
   *
   * @returns A promise that resolves with the movie if found; otherwise, null.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getById(id: number): Promise<Movie | null> {
    try {
      return await this.ormRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Encontra filmes por uma determinada revisão.
   * Se o filme não foi encontrado no banco de dados - retorna null.
   *
   * @param review - A revisão associada ao filme.
   *
   * @returns Uma promise que resolve com o filme se encontrado; caso contrário, null.
   * @throws {DatabaseOperationFailException} Se a operação no banco de dados falhar.
   */

  public async getMovieByReview(review: string): Promise<Movie | null> {
    try {
      const movie: Movie | undefined = await this.ormRepository
        .createQueryBuilder('movie')
        .leftJoinAndSelect('movie.reviews', 'reviews')
        .where('reviews.review = :review', { review })
        .getOne();

      if (!movie) {
        throw new EntityNotFoundException('movie');
      }

      return movie;
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

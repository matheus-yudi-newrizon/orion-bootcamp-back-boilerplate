import { Service as Repository } from 'typedi';
import { DeepPartial, Repository as TypeOrmRepository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Token } from '../entity/Token';
import { DatabaseOperationFailException } from '../exception';

@Repository()
export class TokenRepository {
  private ormRepository: TypeOrmRepository<Token> = MysqlDataSource.getRepository(Token);

  /**
   * Saves a new token in the database.
   *
   * @param token - The token entity to be saved.
   * @returns A promise that resolves with the saved token.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async save(token: Token): Promise<Token> {
    try {
      return await this.ormRepository.save(token);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Creates a new token instance and copies all token properties from this object into a new token.
   * Note that it copies only properties that are present in token schema.
   *
   * @param entityLike - An object containing properties to be copied into a new token instance.
   * @returns A new token instance with copied properties.
   * @throws {DatabaseOperationFailException} If the operation fails.
   */
  public create(entityLike: DeepPartial<Token>): Token {
    try {
      return this.ormRepository.create(entityLike);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Finds a token by a given id.
   * If token was not found in the database - returns null.
   *
   * @param id - The id of the token to retrieve.
   * @returns A promise that resolves with the token if found; otherwise, null.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async findById(id: number): Promise<Token | null> {
    try {
      return await this.ormRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Deletes a token by a given id.
   *
   * @param id - The id of the token to remove.
   * @returns A promise that resolves with void.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async deleteById(id: number): Promise<void> {
    try {
      const tokenToRemove: Token = await this.findById(id);

      if (tokenToRemove) await this.ormRepository.remove(tokenToRemove);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

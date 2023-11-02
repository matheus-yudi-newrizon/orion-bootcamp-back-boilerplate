import { Service as Repository } from 'typedi';
import { Repository as TypeOrmRepository } from 'typeorm';
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

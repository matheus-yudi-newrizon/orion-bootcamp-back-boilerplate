import { Service as Repository } from 'typedi';
import { DeepPartial, Repository as TypeOrmRepository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { User } from '../entity/User';
import { DatabaseOperationFailException } from '../exception';

@Repository()
export class UserRepository {
  private ormRepository: TypeOrmRepository<User> = MysqlDataSource.getRepository(User);

  /**
   * Saves a given user in the database.
   * If user does not exist in the database then inserts, otherwise updates.
   *
   * @param user - The user entity to be saved or updated.
   * @returns A promise that resolves with the saved or updated user.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async save(user: User): Promise<User> {
    try {
      return await this.ormRepository.save(user);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Finds first user by a given email.
   * If user was not found in the database - returns null.
   *
   * @param email - The email of the user to retrieve.
   * @returns A promise that resolves with the user if found; otherwise, null.
   * @throws {DatabaseOperationFailException} If the database operation fails.
   */
  public async getByEmail(email: string): Promise<User | null> {
    try {
      return await this.ormRepository.findOne({ where: { email } });
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }

  /**
   * Creates a new user instance and copies all user properties from this object into a new user.
   * Note that it copies only properties that are present in user schema.
   *
   * @param entityLike - An object containing properties to be copied into a new user instance.
   * @returns A new user instance with copied properties.
   * @throws {DatabaseOperationFailException} If the operation fails.
   */
  public create(entityLike: DeepPartial<User>): User {
    try {
      return this.ormRepository.create(entityLike);
    } catch (error) {
      throw new DatabaseOperationFailException();
    }
  }
}

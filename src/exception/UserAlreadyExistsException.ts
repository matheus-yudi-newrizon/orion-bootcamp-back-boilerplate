import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where a user already exists.
 */
export class UserAlreadyExistsException extends BusinessException {
  /**
   * Creates a new instance of the `UserAlreadyExistsException` class with a specific error message.
   *
   * @param email - The email address of the user that already exists.
   */
  constructor(email: string) {
    super(`The user with email '${email}' already exists.`);
    this.status = 400;
    this.name = 'UserAlreadyExistsException';
  }
}

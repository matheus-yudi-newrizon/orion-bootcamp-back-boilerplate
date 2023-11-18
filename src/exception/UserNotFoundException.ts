import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where a user was not found in database.
 */
export class UserNotFoundException extends BusinessException {
  /**
   * Creates a new instance of the `UserNotFoundException` class with a specific error message.
   */
  constructor() {
    super('The user was not found in database.');
    this.status = 400;
    this.name = 'UserNotFoundException';
  }
}

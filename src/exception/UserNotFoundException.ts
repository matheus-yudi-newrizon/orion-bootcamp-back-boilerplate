import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where a user is not found by email.
 */
export class UserNotFoundException extends BusinessException {
  /**
   *
   * @param email - The email that was not found.
   */
  constructor(email: string) {
    super(`User with email ${email} not found.`);
    this.status = 404;
    this.name = 'UserNotFoundException';
  }
}

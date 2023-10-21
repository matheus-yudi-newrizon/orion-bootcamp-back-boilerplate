import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for violations cases where a provided password does not match the confirmation password.
 */
export class PasswordMismatchException extends BusinessException {
  /**
   * Creates a new instance of the `PasswordMismatchException` class with a specific error message.
   */
  constructor() {
    super('The provided password does not match the confirmation password.');
    this.status = 400;
    this.name = 'PasswordMismatchException';
  }
}

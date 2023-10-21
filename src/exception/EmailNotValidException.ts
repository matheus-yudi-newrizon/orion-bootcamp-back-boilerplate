import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for violations cases where an email is not a valid email address.
 */
export class EmailNotValidException extends BusinessException {
  /**
   * Creates a new instance of the `EmailNotValidException` class with a specific error message.
   */
  constructor() {
    super('The email is not a valid email address.');
    this.status = 400;
    this.name = 'EmailNotValidException';
  }
}

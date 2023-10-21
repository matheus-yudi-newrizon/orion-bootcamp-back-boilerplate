import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases of invalid passwords.
 */
export class PasswordNotValidException extends BusinessException {
  /**
   * Creates a new instance of the `export class PasswordNotValidException extends BusinessException {
` class with a specific error message.
   */
  constructor() {
    super('The password must contain 8 characters, one uppercase letter, and one special character.');
    this.status = 400;
    this.name = 'PasswordNotValidException';
  }
}

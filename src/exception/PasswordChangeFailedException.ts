import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where a password change fails.
 */
export class PasswordChangeFailedException extends BusinessException {
  /**
   * Creates a new instance of the `PasswordChangeFailedException` class with a specific error message.
   *
   */
  constructor() {
    super('Password change failed.');
    this.status = 400;
    this.name = 'PasswordChangeFailedException';
  }
}

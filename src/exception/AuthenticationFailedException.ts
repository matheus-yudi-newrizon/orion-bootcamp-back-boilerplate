import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when authentication fails due to an incorrect email or password.
 */
export class AuthenticationFailedException extends BusinessException {
  /**
   * Creates a new instance of AuthenticationFailedException.
   */
  constructor() {
    super('Authentication failed. Email or password is incorrect.');
    this.status = 401;
    this.name = 'AuthenticationFailedException';
  }
}

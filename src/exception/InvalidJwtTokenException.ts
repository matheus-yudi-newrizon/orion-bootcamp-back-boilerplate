import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when an invalid JWT token is encountered.
 */
export class InvalidJwtTokenException extends BusinessException {
  /**
   * Creates a new instance of InvalidJwtTokenException.
   */
  constructor() {
    super('Invalid JWT token');
    this.status = 401;
    this.name = 'InvalidJwtTokenException';
  }
}

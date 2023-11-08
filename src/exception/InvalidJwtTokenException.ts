import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when an invalid JWT token is encountered.
 */
export class InvalidJwtTokenException extends BusinessException {
  /**
   * Creates a new instance of InvalidJwtTokenException.
   */
  constructor(name: string, message: string) {
    super(message);
    this.status = 401;
    this.name = name;
  }
}

import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when an invalid query string is encountered.
 */
export class InvalidQueryException extends BusinessException {
  /**
   * Creates a new instance of InvalidQueryException.
   */
  constructor() {
    super('The query string is missing query parameters.');
    this.status = 400;
    this.name = 'InvalidQueryException';
  }
}

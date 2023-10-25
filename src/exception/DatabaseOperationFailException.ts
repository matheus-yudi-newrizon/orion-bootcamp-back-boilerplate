import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases of failed database operations.
 */
export class DatabaseOperationFailException extends BusinessException {
  /**
   * Creates a new instance of the `DatabaseOperationFailException` class with a specific error message.
   */
  constructor() {
    super('Unsuccessful database operation.');
    this.status = 500;
    this.name = 'DatabaseOperationFailException';
  }
}

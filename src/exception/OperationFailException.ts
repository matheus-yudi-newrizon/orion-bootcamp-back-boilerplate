import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases of failed operations.
 */
export class OperationFailException extends BusinessException {
  /**
   * Creates a new instance of the `OperationFailException` class with a specific error message.
   */
  constructor(message: string) {
    super(message);
    this.status = 400;
    this.name = 'OperationFailException';
  }
}

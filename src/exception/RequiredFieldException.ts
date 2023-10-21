import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for violations of required fields in request bodies.
 */
export class RequiredFieldException extends BusinessException {
  /**
   * Creates a new instance of the `RequiredFieldException` class with a specific error message.
   *
   * @param field The name of the required field that was not provided.
   */
  constructor(field: string) {
    super(`Required field: ${field}`);
    this.status = 400;
    this.name = 'RequiredFieldException';
  }
}

import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for fields with insufficient length.
 */
export class InsufficientLengthException extends BusinessException {
  /**
   * Creates a new instance of the `InsufficientLengthException` class with a specific error message.
   *
   * @param field The name of the field with insufficient length.
   * @param minLength - The minimum required length for the field.
   */
  constructor(field: string, minLength: number) {
    super(`Insufficient length for field '${field}'. Minimum length required: ${minLength}`);
    this.status = 400;
    this.name = 'InsufficientLengthException';
  }
}

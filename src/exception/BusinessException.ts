/**
 * Class representing a custom exception for business rule violations.
 */
export class BusinessException extends Error {
  /**
   * The HTTP status code associated with the exception.
   * @type {number}
   */
  public status: number;

  /**
   * Creates a new instance of the `BusinessException` class with the specified error message.
   *
   * @param message A descriptive message of the business rule violation.
   */
  constructor(message: string) {
    super(message);
    this.name = 'BusinessException';
  }
}

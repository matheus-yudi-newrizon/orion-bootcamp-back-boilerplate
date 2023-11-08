import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases of failures sending emails.
 */
export class SendEmailFailException extends BusinessException {
  /**
   * Creates a new instance of the `SendEmailFailException` class with a specific error message.
   */
  constructor(message: string) {
    super(message);
    this.status = 500;
    this.name = 'SendEmailFailException';
  }
}

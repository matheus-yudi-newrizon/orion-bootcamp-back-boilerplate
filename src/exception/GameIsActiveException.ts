import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when trying to create a new game if there is one active.
 */
export class GameIsActiveException extends BusinessException {
  /**
   * Creates a new instance of the `GameIsActiveException` class with a specific error message.
   */
  constructor() {
    super('Cannot create a new game if there is one active.');
    this.status = 400;
    this.name = 'GameIsActiveException';
  }
}

import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where a game was not found in database.
 */
export class GameNotFoundException extends BusinessException {
  /**
   * Creates a new instance of the `GameNotFoundException` class with a specific error message.
   */
  constructor() {
    super('The game was not found in database.');
    this.status = 400;
    this.name = 'GameNotFoundException';
  }
}

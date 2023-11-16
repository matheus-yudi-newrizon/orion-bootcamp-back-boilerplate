import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception thrown when movies were not found.
 */
export class MovieNotFoundException extends BusinessException {
  /**
   * Creates a new instance of MovieNotFoundException.
   */
  constructor() {
    super('Movie not found.');
    this.status = 400;
    this.name = 'MovieNotFoundException';
  }
}

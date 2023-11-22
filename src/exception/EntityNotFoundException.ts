import { BusinessException } from './BusinessException';

/**
 * Class representing a custom exception for cases where an entity was not found in database.
 */
export class EntityNotFoundException extends BusinessException {
  /**
   * Creates a new instance of the `EntityNotFoundException` class with a specific error message.
   *
   * @param entity - the entity name.
   */
  constructor(entity: string) {
    super(`The ${entity} was not found in database.`);
    this.status = 400;
    this.name = 'EntityNotFoundException';
  }
}

import { BusinessException } from './BusinessException';

/**
 * Classe que representa uma exceção personalizada para violações de campos obrigatórios no corpo das requisições.
 */
export class RequiredFieldException extends BusinessException {
  /**
   * Cria uma nova instância da classe `RequiredFieldException` com uma mensagem de erro específica.
   *
   * @param field O nome do campo obrigatório que não foi informado.
   */
  constructor(field: string) {
    super(`Required field: ${field}`);
    this.name = 'RequiredFieldException';
  }
}

/**
 * Classe que representa uma exceção personalizada para violações das regras de negócio.
 */
export class BusinessException extends Error {
  /**
   * Cria uma nova instância da classe `BusinessException` com a mensagem de erro especificada.
   *
   * @param message Uma mensagem descritiva da violação da regra de negócio.
   */
  constructor(message: string) {
    super(message);
    this.name = 'BusinessException';
  }
}

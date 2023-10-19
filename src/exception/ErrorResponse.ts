import { Request } from 'express';

/**
 * Classe para representar mensagens de erro HTTP personalizadas.
 */
export class ErrorResponse {
  /**
   * O código de status HTTP da resposta de erro.
   * @type {number}
   */
  private status: number;

  /**
   * O método HTTP da solicitação.
   * @type {string}
   */
  private httpMethod: string;

  /**
   * A URI original da solicitação.
   * @type {string}
   */
  private uri: string;

  /**
   * A mensagem de erro associada à resposta de erro.
   * @type {string}
   */
  private message: string;

  /**
   * Cria uma instância da classe ErrorResponse.
   *
   * @param {Request} request - O objeto da requisição HTTP que gerou erro.
   * @param {string} message - A mensagem de erro a ser associada.
   */
  constructor(request: Request, message: string) {
    this.status = 400;
    this.httpMethod = request.method;
    this.uri = request.originalUrl;
    this.message = message;
  }
}

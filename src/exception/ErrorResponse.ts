import { Request } from 'express';
import { BusinessException } from './BusinessException';

/**
 * Class to represent custom HTTP error messages.
 */
export class ErrorResponse {
  /**
   * The HTTP status code of the error response.
   * @type {number}
   */
  private status: number;

  /**
   * The HTTP method of the request.
   * @type {string}
   */
  private httpMethod: string;

  /**
   * The original URI of the request.
   * @type {string}
   */
  private uri: string;

  /**
   * The error message associated with the error response.
   * @type {string}
   */
  private message: string;

  /**
   * Creates an instance of the ErrorResponse class.
   *
   * @param {Request} request - The HTTP request object that generated the error.
   * @param {BusinessException} exception - The `BusinessException` instance containing details of the error.
   */
  constructor(request: Request, exception: BusinessException) {
    this.status = exception.status;
    this.httpMethod = request.method;
    this.uri = request.originalUrl;
    this.message = exception.message;
  }
}

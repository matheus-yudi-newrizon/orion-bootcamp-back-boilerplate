import { Request } from 'express';

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
   * @param {string} message - The error message to be associated.
   */
  constructor(request: Request, message: string) {
    this.status = 400;
    this.httpMethod = request.method;
    this.uri = request.originalUrl;
    this.message = message;
  }
}

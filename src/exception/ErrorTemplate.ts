export class ErrorTemplate {
  static badRequest(message: string) {
    return {
      success: false,
      message: `Bad Request: ${message}`
    };
  }

  static unauthorized(message: string) {
    return {
      success: false,
      message: `Unauthorized: ${message}`
    };
  }

  static internalServerError(message: string) {
    return {
      success: false,
      message: `Internal Server Error: ${message}`
    };
  }
}

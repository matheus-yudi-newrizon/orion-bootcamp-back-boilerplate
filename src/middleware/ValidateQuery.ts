import { NextFunction, Request, Response } from 'express';
import { InvalidQueryException } from '../exception/InvalidQueryException';
import { IControllerResponse } from '../interface/IControllerResponse';

/**
 * Middleware to validate if the request contains query params.
 *
 * @param fields - An array of strings containing names of the expected params.
 */
export function validateQuery(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!fields.every(field => req.query[field])) throw new InvalidQueryException();

      next();
    } catch (error) {
      const result: IControllerResponse<void> = {
        success: false,
        message: `${error.name}. ${error.message}`
      };

      res.status(400).json(result);
    }
  };
}

import { NextFunction, Request, Response } from 'express';
import { InvalidQueryException } from '../exception';
import { IControllerResponse } from '../interface';

/**
 * Middleware to validate if the request contains the 'review' query param.
 */
export function validateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewKeyword: string = process.env.MOVIE_REVIEW_KEYWORD || 'review';

    if (!req.query[reviewKeyword]) {
      throw new InvalidQueryException();
    }

    next();
  } catch (error) {
    const result: IControllerResponse<void> = {
      success: false,
      message: `${error.name}. ${error.message}`
    };

    res.status(400).json(result);
  }
}

import { NextFunction, Request, Response } from 'express';
import * as middleware from '../../src/middleware';
import { Generate } from '../mocks/Generate';

const generate = new Generate();

describe('ValidateQuery', () => {
  it('should validade the query param and call NextFunction', async () => {
    const req: Partial<Request> = generate.mockRequest();
    req.query = {
      title: 'Pirates',
      genre: 'Action/Adventure'
    };
    const res: Partial<Response> = generate.mockResponse();
    const next: NextFunction = generate.nextFunction();
    const fields: string[] = Object.entries(req.query).map(([key, value]) => key);

    middleware.validateQuery(fields)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should throw InvalidQueryException if a query param is not present', async () => {
    const req: Partial<Request> = generate.mockRequest();
    const res: Partial<Response> = generate.mockResponse();
    const next: NextFunction = generate.nextFunction();
    const fields: string[] = ['title'];

    middleware.validateQuery(fields)(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'InvalidQueryException. The query string is missing query parameters.' });
  });
});

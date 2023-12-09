import { NextFunction, Request, Response } from 'express';
import { InvalidJwtTokenException } from '../../src/exception';
import { ICustomRequest } from '../../src/interface';
import * as middleware from '../../src/middleware';
import { JwtService } from '../../src/security';
import { Generate } from '../mocks/Generate';

const generate = new Generate();

describe('ValidateJwt', () => {
  it('should validade the JWT access token and call NextFunction', async () => {
    const userPayload = generate.userPayload();
    const req: Partial<Request> = generate.mockRequest();
    const res: Partial<Response> = generate.mockResponse();
    const next: NextFunction = generate.nextFunction();

    const jwt: string = generate.encodedJwt();
    req.headers = {
      authorization: `Bearer ${jwt}`
    };

    const spyVerify = jest.spyOn(JwtService, 'verifyToken').mockReturnValue(userPayload);

    middleware.validateJwt(req as Request, res as Response, next);
    expect(spyVerify).toHaveBeenCalledWith(jwt, process.env.ACCESS_TOKEN_SECRET);
    expect((req as ICustomRequest).token).toEqual(userPayload);
    expect(next).toHaveBeenCalled();
  });

  it('should throw InvalidJwtTokenException if the JWT access token is invalid', async () => {
    const req: Partial<Request> = generate.mockRequest();
    const res: Partial<Response> = generate.mockResponse();
    const next: NextFunction = generate.nextFunction();

    let jwt: string = generate.encodedJwt();
    jwt += 'abc123';
    req.headers = {
      authorization: `Bearer ${jwt}`
    };

    const spyVerify = jest.spyOn(JwtService, 'verifyToken').mockImplementation(() => {
      throw new InvalidJwtTokenException('InvalidJwtTokenException', 'The token is not valid.');
    });

    middleware.validateJwt(req as Request, res as Response, next);
    expect(spyVerify).toHaveBeenCalledWith(jwt, process.env.ACCESS_TOKEN_SECRET);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'InvalidJwtTokenException. The token is not valid.' });
  });

  it('should throw JsonWebTokenError if the token was not provided', async () => {
    const req: Partial<Request> = generate.mockRequest();
    const res: Partial<Response> = generate.mockResponse();
    const next: NextFunction = generate.nextFunction();

    middleware.validateJwt(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'JsonWebTokenError. No access token provided.' });
  });
});

import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { IControllerResponse } from '../interface/IControllerResponse';
import { ICustomRequest } from '../interface/ICustomRequest';
import { JwtService } from '../security/JwtService';

/**
 * Middleware to validate the JWT contained in requests for protected routes.
 */
export function validateJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken: string = req.headers['authorization'].split(' ')[1];
    const refreshToken: string = req.cookies['refreshToken'];

    if (!accessToken && !refreshToken) throw new JsonWebTokenError('No token provided.');

    const jwtPayload = JwtService.verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
    (req as ICustomRequest).token = jwtPayload as JwtPayload;

    next();
  } catch (error) {
    const result: IControllerResponse<void> = {
      success: false,
      message: `${error.name}. ${error.message}`
    };

    res.status(401).json(result);
  }
}

import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { IControllerResponse } from '../interface/IControllerResponse';
import { JwtService } from '../security/JwtService';

export interface ICustomRequest extends Request {
  token: JwtPayload;
}

export function validateJwt(req: Request, res: Response, next: NextFunction) {
  const bearerHeader: string = req.headers['authorization'];

  try {
    const bearer: string[] = bearerHeader.split(' ');
    const token: string = bearer[1];
    const jwtPayload = JwtService.verifyToken(token);

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

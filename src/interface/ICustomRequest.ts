import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface ICustomRequest extends Request {
  token: JwtPayload;
}

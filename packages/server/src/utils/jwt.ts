import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const passwordService = {
  hash: (plain: string) => bcrypt.hash(plain, 12),
  compare: (plain: string, hash: string) => bcrypt.compare(plain, hash),
};

export const tokenService = {
  sign: (payload: { sub: string; role: string }) =>
    jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' }),
  verify: (token: string) => jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string },
};

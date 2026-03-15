import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AuthTokens } from '../types';

interface TokenPayload {
  userId: string;
}

export function generateTokens(userId: string): AuthTokens {
  const expiresInSeconds = parseExpiresIn(jwtConfig.expiresIn);
  const refreshExpiresInSeconds = parseExpiresIn(jwtConfig.refreshExpiresIn);

  const accessToken = jwt.sign({ userId }, jwtConfig.secret, {
    expiresIn: expiresInSeconds,
  });

  const refreshToken = jwt.sign({ userId }, jwtConfig.refreshSecret, {
    expiresIn: refreshExpiresInSeconds,
  });

  return { accessToken, refreshToken, expiresIn: expiresInSeconds };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, jwtConfig.refreshSecret) as TokenPayload;
}

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 3600;

  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 3600;
  }
}

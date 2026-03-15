import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuthData, UserPublic } from '../types';

const SALT_ROUNDS = 12;

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthData> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    (err as any).status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashed, name, provider: 'email' },
  });

  // Initialize streak data
  await prisma.streakData.create({
    data: { userId: user.id },
  });

  const tokens = generateTokens(user.id);
  return { user: toPublicUser(user), tokens };
}

export async function login(
  email: string,
  password: string
): Promise<AuthData> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    const err = new Error('Invalid email or password');
    (err as any).status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid email or password');
    (err as any).status = 401;
    throw err;
  }

  const tokens = generateTokens(user.id);
  return { user: toPublicUser(user), tokens };
}

export async function signInWithApple(
  identityToken: string,
  userInfo?: {
    email?: string | null;
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null
): Promise<AuthData> {
  // Decode the identity token to get the Apple subject (sub)
  const decoded = jwt.decode(identityToken) as { sub?: string; email?: string } | null;
  if (!decoded || !decoded.sub) {
    const err = new Error('Invalid Apple identity token');
    (err as any).status = 401;
    throw err;
  }

  const appleId = decoded.sub;
  const email = userInfo?.email || decoded.email || `${appleId}@privaterelay.appleid.com`;

  // Check if user exists by appleId
  let user = await prisma.user.findUnique({ where: { appleId } });

  if (!user) {
    // Check if user exists by email (linking accounts)
    user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Link Apple ID to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { appleId, provider: 'apple' },
      });
    } else {
      // Create new user
      const firstName = userInfo?.name?.firstName || '';
      const lastName = userInfo?.name?.lastName || '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || 'Apple User';

      user = await prisma.user.create({
        data: { email, name, appleId, provider: 'apple' },
      });

      // Initialize streak data
      await prisma.streakData.create({
        data: { userId: user.id },
      });
    }
  }

  const tokens = generateTokens(user.id);
  return { user: toPublicUser(user), tokens };
}

export async function refreshTokens(refreshToken: string): Promise<AuthData> {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid refresh token');
    (err as any).status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    const err = new Error('User not found');
    (err as any).status = 401;
    throw err;
  }

  const tokens = generateTokens(user.id);
  return { user: toPublicUser(user), tokens };
}

export async function getMe(userId: string): Promise<UserPublic> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    (err as any).status = 404;
    throw err;
  }
  return toPublicUser(user);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.signInWithApple = signInWithApple;
exports.refreshTokens = refreshTokens;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const SALT_ROUNDS = 12;
function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
    };
}
async function register(email, password, name) {
    const existing = await database_1.default.user.findUnique({ where: { email } });
    if (existing) {
        const err = new Error('Email already registered');
        err.status = 409;
        throw err;
    }
    const hashed = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    const user = await database_1.default.user.create({
        data: { email, password: hashed, name, provider: 'email' },
    });
    // Initialize streak data
    await database_1.default.streakData.create({
        data: { userId: user.id },
    });
    const tokens = (0, jwt_1.generateTokens)(user.id);
    return { user: toPublicUser(user), tokens };
}
async function login(email, password) {
    const user = await database_1.default.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
    }
    const tokens = (0, jwt_1.generateTokens)(user.id);
    return { user: toPublicUser(user), tokens };
}
async function signInWithApple(identityToken, userInfo) {
    // Decode the identity token to get the Apple subject (sub)
    const decoded = jsonwebtoken_1.default.decode(identityToken);
    if (!decoded || !decoded.sub) {
        const err = new Error('Invalid Apple identity token');
        err.status = 401;
        throw err;
    }
    const appleId = decoded.sub;
    const email = userInfo?.email || decoded.email || `${appleId}@privaterelay.appleid.com`;
    // Check if user exists by appleId
    let user = await database_1.default.user.findUnique({ where: { appleId } });
    if (!user) {
        // Check if user exists by email (linking accounts)
        user = await database_1.default.user.findUnique({ where: { email } });
        if (user) {
            // Link Apple ID to existing account
            user = await database_1.default.user.update({
                where: { id: user.id },
                data: { appleId, provider: 'apple' },
            });
        }
        else {
            // Create new user
            const firstName = userInfo?.name?.firstName || '';
            const lastName = userInfo?.name?.lastName || '';
            const name = [firstName, lastName].filter(Boolean).join(' ') || 'Apple User';
            user = await database_1.default.user.create({
                data: { email, name, appleId, provider: 'apple' },
            });
            // Initialize streak data
            await database_1.default.streakData.create({
                data: { userId: user.id },
            });
        }
    }
    const tokens = (0, jwt_1.generateTokens)(user.id);
    return { user: toPublicUser(user), tokens };
}
async function refreshTokens(refreshToken) {
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        const err = new Error('Invalid refresh token');
        err.status = 401;
        throw err;
    }
    const user = await database_1.default.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        const err = new Error('User not found');
        err.status = 401;
        throw err;
    }
    const tokens = (0, jwt_1.generateTokens)(user.id);
    return { user: toPublicUser(user), tokens };
}
async function getMe(userId) {
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    return toPublicUser(user);
}
//# sourceMappingURL=authService.js.map
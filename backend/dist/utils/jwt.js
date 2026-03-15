"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
function generateTokens(userId) {
    const expiresInSeconds = parseExpiresIn(jwt_1.jwtConfig.expiresIn);
    const refreshExpiresInSeconds = parseExpiresIn(jwt_1.jwtConfig.refreshExpiresIn);
    const accessToken = jsonwebtoken_1.default.sign({ userId }, jwt_1.jwtConfig.secret, {
        expiresIn: expiresInSeconds,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, jwt_1.jwtConfig.refreshSecret, {
        expiresIn: refreshExpiresInSeconds,
    });
    return { accessToken, refreshToken, expiresIn: expiresInSeconds };
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.secret);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, jwt_1.jwtConfig.refreshSecret);
}
function parseExpiresIn(value) {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match)
        return 3600;
    const num = parseInt(match[1], 10);
    switch (match[2]) {
        case 's': return num;
        case 'm': return num * 60;
        case 'h': return num * 3600;
        case 'd': return num * 86400;
        default: return 3600;
    }
}
//# sourceMappingURL=jwt.js.map
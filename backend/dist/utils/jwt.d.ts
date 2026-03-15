import { AuthTokens } from '../types';
interface TokenPayload {
    userId: string;
}
export declare function generateTokens(userId: string): AuthTokens;
export declare function verifyAccessToken(token: string): TokenPayload;
export declare function verifyRefreshToken(token: string): TokenPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map
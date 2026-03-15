import { AuthData, UserPublic } from '../types';
export declare function register(email: string, password: string, name: string): Promise<AuthData>;
export declare function login(email: string, password: string): Promise<AuthData>;
export declare function signInWithApple(identityToken: string, userInfo?: {
    email?: string | null;
    name?: {
        firstName?: string | null;
        lastName?: string | null;
    } | null;
} | null): Promise<AuthData>;
export declare function refreshTokens(refreshToken: string): Promise<AuthData>;
export declare function getMe(userId: string): Promise<UserPublic>;
//# sourceMappingURL=authService.d.ts.map
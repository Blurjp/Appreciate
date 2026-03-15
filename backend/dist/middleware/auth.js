"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        (0, response_1.error)(res, 'Access token required', 'AUTH_REQUIRED', 401);
        return;
    }
    const token = header.slice(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.userId = payload.userId;
        next();
    }
    catch {
        (0, response_1.error)(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
    }
}
/** Optional auth — sets userId if token present, but doesn't block */
function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        try {
            const payload = (0, jwt_1.verifyAccessToken)(header.slice(7));
            req.userId = payload.userId;
        }
        catch {
            // Ignore invalid tokens for optional auth
        }
    }
    next();
}
//# sourceMappingURL=auth.js.map
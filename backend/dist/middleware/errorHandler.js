"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    console.error('[Error]', err.message);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: {
                message: err.errors.map((e) => e.message).join(', '),
                code: 'VALIDATION_ERROR',
            },
        });
        return;
    }
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            success: false,
            error: { message: 'CORS not allowed', code: 'CORS_ERROR' },
        });
        return;
    }
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
            code: 'INTERNAL_ERROR',
        },
    });
}
//# sourceMappingURL=errorHandler.js.map
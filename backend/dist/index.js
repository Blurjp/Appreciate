"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = parseInt(process.env.PORT || '3001', 10);
async function main() {
    // Verify database connection
    await database_1.default.$connect();
    console.log('[Database] Connected to PostgreSQL');
    app_1.default.listen(PORT, '0.0.0.0', () => {
        console.log(`[Server] Appreciate API running on port ${PORT}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
}
main().catch((err) => {
    console.error('[Fatal] Failed to start server:', err);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('[Server] SIGTERM received, shutting down...');
    await database_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('[Server] SIGINT received, shutting down...');
    await database_1.default.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map
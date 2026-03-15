"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
function success(res, data, status = 200) {
    const body = { success: true, data };
    res.status(status).json(body);
}
function error(res, message, code, status) {
    const body = { success: false, error: { message, code } };
    res.status(status).json(body);
}
//# sourceMappingURL=response.js.map
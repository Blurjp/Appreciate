"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const response_1 = require("../utils/response");
function validate(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const message = result.error.errors.map((e) => e.message).join(', ');
            (0, response_1.error)(res, message, 'VALIDATION_ERROR', 400);
            return;
        }
        // Replace with parsed/coerced values
        if (source === 'body') {
            req.body = result.data;
        }
        else {
            req.validatedQuery = result.data;
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map
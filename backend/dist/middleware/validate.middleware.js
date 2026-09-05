"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
function validateRequest(schema) {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const issues = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
                return next(new apiResponse_1.AppError('Validation Error', 400, 'VALIDATION_ERROR', issues));
            }
            next(err);
        }
    };
}
//# sourceMappingURL=validate.middleware.js.map
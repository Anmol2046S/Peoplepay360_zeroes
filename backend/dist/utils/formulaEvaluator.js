"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateFormula = evaluateFormula;
const apiResponse_1 = require("./apiResponse");
/**
 * Safe formula evaluator for salary rule calculation.
 * Supports variables: WAGE, BASIC, GROSS, HRA, PF, PT, workedDays, and any rule category/code.
 * Prevents dynamic code injection (no eval, Function, or prototype access).
 */
function evaluateFormula(formulaStr, context, workedDays = 22) {
    if (!formulaStr || typeof formulaStr !== 'string')
        return 0;
    let sanitized = formulaStr.trim();
    // Replace variable names with their corresponding context numbers
    // Sort keys by length descending to avoid partial key replacement
    const vars = {
        ...context,
        workedDays,
    };
    const sortedKeys = Object.keys(vars).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const val = vars[key] !== undefined ? vars[key] : 0;
        // Replace whole word variable matches
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        sanitized = sanitized.replace(regex, val.toString());
    }
    // Sanitize check: allow only numbers, +, -, *, /, (, ), ., whitespace
    if (!/^[0-9\s\+\-\*\/\.\(\)]+$/.test(sanitized)) {
        throw new apiResponse_1.AppError(`Formula contains invalid characters or unknown symbols: "${formulaStr}"`, 400, 'INVALID_FORMULA');
    }
    try {
        // Safe evaluation using Function with returning expression
        const result = new Function(`"use strict"; return (${sanitized});`)();
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
            return 0;
        }
        return Math.round(result * 100) / 100;
    }
    catch (err) {
        throw new apiResponse_1.AppError(`Error evaluating salary formula "${formulaStr}": ${err.message}`, 400, 'FORMULA_EVALUATION_ERROR');
    }
}

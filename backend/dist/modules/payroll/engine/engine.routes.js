"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = engineRoutes;
const engine_controller_1 = require("./engine.controller");
const auth_1 = require("../../../middleware/auth");
async function engineRoutes(app) {
    const engineController = new engine_controller_1.EngineController();
    app.post('/:payrunId/calculate', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_CALCULATE')] }, engineController.calculate);
}

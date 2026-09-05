"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ruleRoutes;
const rule_controller_1 = require("./rule.controller");
const auth_1 = require("../../../middleware/auth");
async function ruleRoutes(app) {
    const ruleController = new rule_controller_1.RuleController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_CALCULATE')] }, ruleController.create);
    app.get('/structure/:structureId', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_CALCULATE')] }, ruleController.getByStructureId);
}

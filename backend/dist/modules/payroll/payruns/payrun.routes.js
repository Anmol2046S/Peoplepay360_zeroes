"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = payrunRoutes;
const payrun_controller_1 = require("./payrun.controller");
const auth_1 = require("../../../middleware/auth");
async function payrunRoutes(app) {
    const payrunController = new payrun_controller_1.PayrunController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_CALCULATE')] }, payrunController.initialize);
    app.get('/', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_READ')] }, payrunController.getAll);
    app.get('/:id', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_READ')] }, payrunController.getById);
    // Approvals & Finalization
    app.post('/:id/submit', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_CALCULATE')] }, payrunController.submitForApproval);
    app.post('/:id/approve', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_APPROVE')] }, payrunController.approve);
    app.post('/:id/reject', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_APPROVE')] }, payrunController.reject);
    app.post('/:id/finalize', { preHandler: [(0, auth_1.requirePermission)('PAYRUN_APPROVE')] }, payrunController.finalize);
}

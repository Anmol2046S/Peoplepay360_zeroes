"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = timeOffRoutes;
const timeoff_controller_1 = require("./timeoff.controller");
const auth_1 = require("../../middleware/auth");
async function timeOffRoutes(app) {
    const timeOffController = new timeoff_controller_1.TimeOffController();
    app.post('/requests', { preHandler: [(0, auth_1.requirePermission)('TIMEOFF_REQUEST')] }, timeOffController.requestTimeOff);
    app.post('/requests/:id/approve', { preHandler: [(0, auth_1.requirePermission)('TIMEOFF_APPROVE')] }, timeOffController.approve);
    app.post('/requests/:id/reject', { preHandler: [(0, auth_1.requirePermission)('TIMEOFF_APPROVE')] }, timeOffController.reject);
}

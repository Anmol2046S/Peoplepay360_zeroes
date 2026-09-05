"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dashboardRoutes;
const dashboard_controller_1 = require("./dashboard.controller");
const auth_1 = require("../../middleware/auth");
async function dashboardRoutes(app) {
    const dashboardController = new dashboard_controller_1.DashboardController();
    app.get('/metrics', { preHandler: [auth_1.requireAuth] }, dashboardController.getMetrics.bind(dashboardController));
}

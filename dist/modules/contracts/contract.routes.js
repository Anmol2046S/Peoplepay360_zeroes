"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = contractRoutes;
const contract_controller_1 = require("./contract.controller");
const auth_1 = require("../../middleware/auth");
async function contractRoutes(app) {
    const contractController = new contract_controller_1.ContractController();
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('CONTRACT_CREATE')] }, contractController.create);
    app.get('/employee/:employeeId', { preHandler: [(0, auth_1.requirePermission)('CONTRACT_READ')] }, contractController.getByEmployee);
}

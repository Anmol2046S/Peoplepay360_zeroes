"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = structureRoutes;
const structure_controller_1 = require("./structure.controller");
const auth_1 = require("../../../middleware/auth");
async function structureRoutes(app) {
    const structureController = new structure_controller_1.StructureController();
    // Assuming HR_MANAGER or ADMIN can create structures. Permission could be 'STRUCTURE_CREATE' or similar.
    app.post('/', { preHandler: [(0, auth_1.requirePermission)('STRUCTURE_WRITE')] }, structureController.create);
    app.get('/', { preHandler: [(0, auth_1.requirePermission)('STRUCTURE_READ')] }, structureController.getAll);
    app.get('/:id', { preHandler: [(0, auth_1.requirePermission)('STRUCTURE_READ')] }, structureController.getById);
    app.patch('/:id', { preHandler: [(0, auth_1.requirePermission)('STRUCTURE_WRITE')] }, structureController.update);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureController = void 0;
const structure_service_1 = require("./structure.service");
const structure_schema_1 = require("./structure.schema");
class StructureController {
    structureService;
    constructor() {
        this.structureService = new structure_service_1.StructureService();
    }
    create = async (request, reply) => {
        const input = structure_schema_1.CreateStructureSchema.parse(request.body);
        const orgId = request.user.orgId;
        const result = await this.structureService.create(orgId, input);
        return reply.status(201).send({ success: true, data: result });
    };
    getAll = async (request, reply) => {
        const orgId = request.user.orgId;
        const results = await this.structureService.getAll(orgId);
        return reply.send({ success: true, data: results });
    };
    getById = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.structureService.getById(orgId, id);
        return reply.send({ success: true, data: result });
    };
    update = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const input = structure_schema_1.UpdateStructureSchema.parse(request.body);
        const result = await this.structureService.update(orgId, id, input);
        return reply.send({ success: true, data: result });
    };
}
exports.StructureController = StructureController;

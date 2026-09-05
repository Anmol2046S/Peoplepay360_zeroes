"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrunController = void 0;
const payrun_service_1 = require("./payrun.service");
const payrun_schema_1 = require("./payrun.schema");
class PayrunController {
    payrunService;
    constructor() {
        this.payrunService = new payrun_service_1.PayrunService();
    }
    initialize = async (request, reply) => {
        const input = payrun_schema_1.CreatePayrunSchema.parse(request.body);
        const orgId = request.user.orgId;
        const userId = request.user.id;
        const result = await this.payrunService.initialize(orgId, input, userId);
        return reply.status(201).send({ success: true, data: result });
    };
    getAll = async (request, reply) => {
        const orgId = request.user.orgId;
        const results = await this.payrunService.getAll(orgId);
        return reply.send({ success: true, data: results });
    };
    getById = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.payrunService.getById(orgId, id);
        return reply.send({ success: true, data: result });
    };
    submitForApproval = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.payrunService.submitForApproval(orgId, id);
        return reply.send({ success: true, data: result });
    };
    approve = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const userId = request.user.id;
        const result = await this.payrunService.approve(orgId, id, userId);
        return reply.send({ success: true, data: result });
    };
    reject = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.payrunService.reject(orgId, id);
        return reply.send({ success: true, data: result });
    };
    finalize = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.payrunService.finalize(orgId, id);
        return reply.send({ success: true, data: result });
    };
}
exports.PayrunController = PayrunController;

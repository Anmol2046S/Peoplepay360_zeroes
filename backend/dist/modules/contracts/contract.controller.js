"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_service_1 = require("./contract.service");
const contract_schema_1 = require("./contract.schema");
class ContractController {
    contractService;
    constructor() {
        this.contractService = new contract_service_1.ContractService();
    }
    create = async (request, reply) => {
        const input = contract_schema_1.CreateContractSchema.parse(request.body);
        const orgId = request.user.orgId;
        const result = await this.contractService.create(orgId, input);
        return reply.status(201).send({ success: true, data: result });
    };
    getByEmployee = async (request, reply) => {
        const orgId = request.user.orgId;
        const { employeeId } = request.params;
        const contracts = await this.contractService.getByEmployee(orgId, employeeId);
        return reply.send({ success: true, data: contracts });
    };
}
exports.ContractController = ContractController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_service_1 = require("../services/contract.service");
const apiResponse_1 = require("../utils/apiResponse");
class ContractController {
    static async getAllContracts(req, res, next) {
        try {
            const employeeId = req.query.employeeId;
            const status = req.query.status;
            const contracts = await contract_service_1.ContractService.getAllContracts({ employeeId, status });
            return (0, apiResponse_1.sendSuccess)(res, contracts, 'Contracts fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async getContractById(req, res, next) {
        try {
            const id = req.params.id;
            const contract = await contract_service_1.ContractService.getContractById(id);
            return (0, apiResponse_1.sendSuccess)(res, contract, 'Contract fetched successfully');
        }
        catch (err) {
            next(err);
        }
    }
    static async createContract(req, res, next) {
        try {
            const newContract = await contract_service_1.ContractService.createContract(req.body);
            return (0, apiResponse_1.sendSuccess)(res, newContract, 'Contract created successfully', 201);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ContractController = ContractController;
//# sourceMappingURL=contract.controller.js.map
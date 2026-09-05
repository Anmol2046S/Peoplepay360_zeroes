"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("./employee.service");
const employee_schema_1 = require("./employee.schema");
class EmployeeController {
    employeeService;
    constructor() {
        this.employeeService = new employee_service_1.EmployeeService();
    }
    create = async (request, reply) => {
        const input = employee_schema_1.CreateEmployeeSchema.parse(request.body);
        const orgId = request.user.orgId;
        const employee = await this.employeeService.create(orgId, input);
        return reply.status(201).send({ success: true, data: employee });
    };
    getAll = async (request, reply) => {
        const orgId = request.user.orgId;
        const employees = await this.employeeService.getAll(orgId);
        return reply.send({ success: true, data: employees });
    };
    getById = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const employee = await this.employeeService.getById(orgId, id);
        return reply.send({ success: true, data: employee });
    };
    update = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const input = employee_schema_1.UpdateEmployeeSchema.parse(request.body);
        const employee = await this.employeeService.update(orgId, id, input);
        return reply.send({ success: true, data: employee });
    };
}
exports.EmployeeController = EmployeeController;

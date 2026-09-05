"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffController = void 0;
const timeoff_service_1 = require("./timeoff.service");
const timeoff_schema_1 = require("./timeoff.schema");
class TimeOffController {
    timeOffService;
    constructor() {
        this.timeOffService = new timeoff_service_1.TimeOffService();
    }
    requestTimeOff = async (request, reply) => {
        const input = timeoff_schema_1.RequestTimeOffSchema.parse(request.body);
        const orgId = request.user.orgId;
        const result = await this.timeOffService.requestTimeOff(orgId, input);
        return reply.status(201).send({ success: true, data: result });
    };
    approve = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.timeOffService.approve(orgId, id);
        return reply.send({ success: true, data: result });
    };
    reject = async (request, reply) => {
        const orgId = request.user.orgId;
        const { id } = request.params;
        const result = await this.timeOffService.reject(orgId, id);
        return reply.send({ success: true, data: result });
    };
}
exports.TimeOffController = TimeOffController;

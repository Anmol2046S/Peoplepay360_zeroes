"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleController = void 0;
const rule_service_1 = require("./rule.service");
const rule_schema_1 = require("./rule.schema");
class RuleController {
    ruleService;
    constructor() {
        this.ruleService = new rule_service_1.RuleService();
    }
    create = async (request, reply) => {
        const input = rule_schema_1.CreateRuleSchema.parse(request.body);
        const orgId = request.user.orgId;
        const result = await this.ruleService.create(orgId, input);
        return reply.status(201).send({ success: true, data: result });
    };
    getByStructureId = async (request, reply) => {
        const orgId = request.user.orgId;
        const { structureId } = request.params;
        const results = await this.ruleService.getByStructureId(orgId, structureId);
        return reply.send({ success: true, data: results });
    };
}
exports.RuleController = RuleController;

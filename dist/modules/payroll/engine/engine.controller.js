"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineController = void 0;
const engine_service_1 = require("./engine.service");
class EngineController {
    engineService;
    constructor() {
        this.engineService = new engine_service_1.EngineService();
    }
    calculate = async (request, reply) => {
        const orgId = request.user.orgId;
        const { payrunId } = request.params;
        const result = await this.engineService.calculatePayrun(orgId, payrunId);
        return reply.status(200).send({ success: true, data: result });
    };
}
exports.EngineController = EngineController;

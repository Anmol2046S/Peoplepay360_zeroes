"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// All authenticated users can read working schedules
router.get('/', schedule_controller_1.ScheduleController.getAllSchedules);
router.get('/:id', schedule_controller_1.ScheduleController.getScheduleById);
router.post('/', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_MANAGER]), schedule_controller_1.ScheduleController.createSchedule);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map
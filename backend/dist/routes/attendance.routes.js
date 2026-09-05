"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/active-session', attendance_controller_1.AttendanceController.getActiveSession);
router.post('/check-in', attendance_controller_1.AttendanceController.checkIn);
router.post('/check-out', attendance_controller_1.AttendanceController.checkOut);
router.get('/', attendance_controller_1.AttendanceController.getAllAttendance);
// Manual administrative corrections restricted to HR/Admin roles
router.put('/:id', (0, rbac_middleware_1.requireRole)([client_1.SystemRole.HR_MANAGER, client_1.SystemRole.HR_PAYROLL_USER, client_1.SystemRole.HR_PAYROLL_MANAGER]), attendance_controller_1.AttendanceController.updateAttendance);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map
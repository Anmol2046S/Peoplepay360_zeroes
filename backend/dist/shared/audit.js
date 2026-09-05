"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const db_1 = require("../database/db");
const logAudit = async (payload) => {
    // Fire and forget to not block the main request loop, or await it if strict auditing is needed.
    // For payroll systems, strict auditing is usually preferred.
    try {
        await db_1.prisma.auditLog.create({
            data: {
                orgId: payload.orgId,
                userId: payload.userId,
                action: payload.action,
                entity: payload.entity,
                entityId: payload.entityId,
                metadata: payload.metadata || {},
            },
        });
    }
    catch (error) {
        console.error('Failed to write audit log', error);
    }
};
exports.logAudit = logAudit;

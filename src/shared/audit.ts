import { prisma } from '../database/db';

interface AuditLogPayload {
  orgId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
}

export const logAudit = async (payload: AuditLogPayload) => {
  // Fire and forget to not block the main request loop, or await it if strict auditing is needed.
  // For payroll systems, strict auditing is usually preferred.
  try {
    await prisma.auditLog.create({
      data: {
        orgId: payload.orgId,
        userId: payload.userId,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId,
        metadata: payload.metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to write audit log', error);
  }
};

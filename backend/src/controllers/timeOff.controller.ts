import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { TimeOffService } from '../services/timeOff.service';
import { sendSuccess, AppError } from '../utils/apiResponse';
import { TimeOffAllocationStatus, TimeOffRequestStatus } from '@prisma/client';

export class TimeOffController {
  // Types
  static async getAllTypes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const types = await TimeOffService.getAllTypes();
      return sendSuccess(res, types, 'Time off types fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createType(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = await TimeOffService.createType(req.body);
      return sendSuccess(res, type, 'Time off type created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // Allocations
  static async getAllAllocations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let employeeId = req.query.employeeId as string;
      const status = req.query.status as TimeOffAllocationStatus;

      if (req.user?.role === 'EMPLOYEE') {
        if (!req.user.employeeId) throw new AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
        employeeId = req.user.employeeId;
      }

      const allocations = await TimeOffService.getAllAllocations({ employeeId, status });
      return sendSuccess(res, allocations, 'Leave allocations fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getAllocationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const allocation = await TimeOffService.getAllocationById(id);
      return sendSuccess(res, allocation, 'Leave allocation fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createAllocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const allocation = await TimeOffService.createAllocation(req.body);
      return sendSuccess(res, allocation, 'Leave allocation granted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  // Requests
  static async getAllRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let employeeId = req.query.employeeId as string;
      const status = req.query.status as TimeOffRequestStatus;

      if (req.user?.role === 'EMPLOYEE') {
        if (!req.user.employeeId) throw new AppError('No employee profile linked.', 400, 'NO_EMPLOYEE_LINK');
        employeeId = req.user.employeeId;
      }

      const requests = await TimeOffService.getAllRequests({ employeeId, status });
      return sendSuccess(res, requests, 'Time off requests fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getRequestById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const request = await TimeOffService.getRequestById(id);
      return sendSuccess(res, request, 'Time off request fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = req.body.employeeId || req.user?.employeeId;
      if (!employeeId) throw new AppError('Employee ID is required.', 400, 'EMPLOYEE_REQUIRED');

      const request = await TimeOffService.createRequest({
        ...req.body,
        employeeId,
      });

      return sendSuccess(res, request, 'Leave request submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async approveRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const approverName = req.user?.name || 'Manager';
      const approved = await TimeOffService.approveRequest(id, approverName, req.user?.employeeId, req.user?.id);
      return sendSuccess(res, approved, 'Leave request approved and balance updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async refuseRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const approverName = req.user?.name || 'Manager';
      const refused = await TimeOffService.refuseRequest(id, approverName);
      return sendSuccess(res, refused, 'Leave request refused');
    } catch (err) {
      next(err);
    }
  }
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ContractService } from '../services/contract.service';
import { sendSuccess } from '../utils/apiResponse';
import { ContractStatus } from '@prisma/client';

export class ContractController {
  static async getAllContracts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = req.query.employeeId as string;
      const status = req.query.status as ContractStatus;
      const contracts = await ContractService.getAllContracts({ employeeId, status });
      return sendSuccess(res, contracts, 'Contracts fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getContractById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const contract = await ContractService.getContractById(id);
      return sendSuccess(res, contract, 'Contract fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createContract(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const newContract = await ContractService.createContract(req.body);
      return sendSuccess(res, newContract, 'Contract created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

import { Request, Response } from "express";
import { ApiResponse, ApiError } from "../utils";
import { employeeService } from "../services";
import { logInfo, logError } from "../utils/logger";

class EmployeeController {
  public async getAll(req: Request, res: Response) {
    const employees = await employeeService.getAll();
    logInfo("Fetched all employees", { user: (req.user as any)?.id });
    return res.json(
      new ApiResponse("Employees fetched successfully", employees)
    );
  }

  public async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const employee = await employeeService.getById(Number(id));
      logInfo("Fetched employee by id", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      return res.json(
        new ApiResponse("Employee fetched successfully", employee)
      );
    } catch (error) {
      logError("Employee not found", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      throw error;
    }
  }

  public async getSubordinates(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const subordinates = await employeeService.getSubordinates(Number(id));
      logInfo("Fetched subordinates", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      return res.json(
        new ApiResponse("Subordinates fetched successfully", subordinates)
      );
    } catch (error) {
      logError("Failed to fetch subordinates", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      throw error;
    }
  }

  public async getManagers(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const managers = await employeeService.getManagers(Number(id));
      logInfo("Fetched managers", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      return res.json(
        new ApiResponse("Managers fetched successfully", managers)
      );
    } catch (error) {
      logError("Failed to fetch managers", {
        employeeId: id,
        user: (req.user as any)?.id,
      });
      throw error;
    }
  }
}

export const employeeController = new EmployeeController();

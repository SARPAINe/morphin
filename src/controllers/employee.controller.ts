import { Request, Response } from "express";
import { ApiResponse, ApiError } from "../utils";
import { employeeService } from "../services";

class EmployeeController {
  public async getAll(req: Request, res: Response) {
    const employees = await employeeService.getAll();
    return res.json(
      new ApiResponse("Employees fetched successfully", employees)
    );
  }

  public async getById(req: Request, res: Response) {
    const { id } = req.params;
    const employee = await employeeService.getById(Number(id));
    if (!employee) throw new ApiError("Employee not found", 404);
    return res.json(new ApiResponse("Employee fetched successfully", employee));
  }

  public async getSubordinates(req: Request, res: Response) {
    const { id } = req.params;
    const subordinates = await employeeService.getSubordinates(Number(id));
    return res.json(
      new ApiResponse("Subordinates fetched successfully", subordinates)
    );
  }

  public async getManagers(req: Request, res: Response) {
    const { id } = req.params;
    const managers = await employeeService.getManagers(Number(id));
    return res.json(new ApiResponse("Managers fetched successfully", managers));
  }
}

export const employeeController = new EmployeeController();

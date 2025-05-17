import Employee from "../models/employee.model";
import { EmployeeClosure } from "../models";
import { Op } from "sequelize";

class EmployeeService {
  async getAll() {
    return Employee.findAll();
  }

  async getById(id: number) {
    const employee = await Employee.findByPk(id);
    if (!employee) throw new Error("Employee not found");
    return employee;
  }

  async getSubordinates(id: number) {
    // Find all employees where the given id is the ancestor (excluding self)
    const closures = await EmployeeClosure.findAll({
      where: { ancestor_id: id },
      include: [
        {
          model: Employee,
          as: "descendant",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
          order: [["depth", "ASC"]],
        },
      ],
    });
    return closures.map((c: any) => c.descendant);
  }

  async getManagers(id: number) {
    // Find all employees where the given id is the descendant (excluding self)
    const closures = await EmployeeClosure.findAll({
      where: { descendant_id: id, depth: { [Op.gt]: 0 } },
      include: [
        {
          model: Employee,
          as: "ancestor",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
          order: [["depth", "ASC"]],
        },
      ],
    });
    return closures.map((c: any) => c.ancestor);
  }
}

export const employeeService = new EmployeeService();

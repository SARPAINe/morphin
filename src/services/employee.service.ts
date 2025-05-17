import Employee from "../models/employee.model";
import { EmployeeClosure } from "../models";
import { Op } from "sequelize";
import redis from "../utils/cache";

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
    const cacheKey = `employee:${id}:subordinates`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const closures = await EmployeeClosure.findAll({
      where: { ancestor_id: id, depth: { [Op.gt]: 0 } },
      include: [
        {
          model: Employee,
          as: "descendant",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
      ],
      order: [["depth", "ASC"]],
    });
    const subordinates = closures.map((c: any) => c.descendant);

    await redis.set(cacheKey, JSON.stringify(subordinates), "EX", 30);
    return subordinates;
  }

  async getManagers(id: number) {
    const cacheKey = `employee:${id}:managers`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const closures = await EmployeeClosure.findAll({
      where: { descendant_id: id, depth: { [Op.gt]: 0 } },
      include: [
        {
          model: Employee,
          as: "ancestor",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
      ],
      order: [["depth", "ASC"]],
    });
    const managers = closures.map((c: any) => c.ancestor);

    await redis.set(cacheKey, JSON.stringify(managers), "EX", 30);
    return managers;
  }
}

export const employeeService = new EmployeeService();

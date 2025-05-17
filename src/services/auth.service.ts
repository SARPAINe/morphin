import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils";
import { Employee, EmployeeClosure } from "../models";
import { EmployeeRole } from "../enums/employeeRole.enum";

class AuthService {
  private validateCredentials(email: string, password: string) {
    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }
  }

  private async checkExistingEmployee(email: string) {
    const employee = await Employee.findOne({ where: { email } });
    if (employee) {
      throw new ApiError("Email already in use", 400);
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async comparePasswords(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }

  public generateToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
  }

  public async register(
    name: string,
    email: string,
    password: string,
    role: EmployeeRole,
    parent_id?: number
  ) {
    const transaction = await Employee.sequelize!.transaction();
    try {
      this.validateCredentials(email, password);
      await this.checkExistingEmployee(email);
      const hashedPassword = await this.hashPassword(password);

      const employee = await Employee.create(
        {
          name,
          email,
          password: hashedPassword,
          role,
          parent_id,
        },
        { transaction }
      );

      await EmployeeClosure.create(
        {
          ancestor_id: employee.id,
          descendant_id: employee.id,
          depth: 0,
        },
        { transaction }
      );

      if (parent_id) {
        const parentClosures = await EmployeeClosure.findAll({
          where: { descendant_id: parent_id },
          transaction,
        });

        const insertions = parentClosures.map((closure) => ({
          ancestor_id: closure.ancestor_id,
          descendant_id: employee.id,
          depth: closure.depth + 1,
        }));

        await EmployeeClosure.bulkCreate(insertions, { transaction });
      }

      await transaction.commit();
      delete employee.dataValues.password;
      return employee;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public async login(email: string, password: string) {
    this.validateCredentials(email, password);

    const employee = await Employee.findOne({ where: { email } });
    if (
      !employee ||
      !(await this.comparePasswords(password, employee.password!))
    ) {
      throw new ApiError("Invalid email or password", 401);
    }

    const token = this.generateToken({
      id: employee.id,
      email: employee.email,
    });
    return { token };
  }
}

export const authService = new AuthService();

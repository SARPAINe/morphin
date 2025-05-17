import bcrypt from "bcrypt";
import Employee from "../models/employee.model";
import EmployeeClosure from "../models/employeeClosure.model";
import sequelize from "../database";
import { EmployeeRole } from "../enums/employeeRole.enum";

const TOTAL_EMPLOYEES = 1000;

// You can tune this function to increase max children as hierarchy grows
function getMaxChildrenAtLevel(level: number) {
  return Math.min(10, Math.floor(level / 2) + 1);
}

// Simple role assignment by depth for demo
function getRoleByDepth(depth: number): EmployeeRole {
  if (depth === 0) return EmployeeRole.CEO;
  if (depth === 1) return EmployeeRole.CTO;
  if (depth <= 3) return EmployeeRole.ProjectManager;
  if (depth <= 5) return EmployeeRole.SeniorSoftwareEng;
  return EmployeeRole.SoftwareEng;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function registerEmployee(
  name: string,
  email: string,
  password: string,
  role: EmployeeRole,
  parent_id: number | null,
  transaction: any
) {
  const hashedPassword = await hashPassword(password);

  const employee = await Employee.create(
    { name, email, password: hashedPassword, role, parent_id },
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

  return employee;
}

async function seedHierarchy() {
  try {
    // Ensure tables are created
    await sequelize.sync();

    const transaction = await sequelize.transaction();

    // 1. Create CEO
    const ceo = await registerEmployee(
      "CEO",
      "ceo@company.com",
      "securepassword",
      EmployeeRole.CEO,
      null,
      transaction
    );

    const queue: Array<{ id: number; depth: number; childrenCount: number }> = [
      { id: ceo.id, depth: 0, childrenCount: 0 },
    ];

    let createdEmployees = 1;

    while (createdEmployees < TOTAL_EMPLOYEES) {
      const parent = queue.shift();
      if (!parent) break;

      const maxChildren = getMaxChildrenAtLevel(parent.depth);
      const remainingToCreate = TOTAL_EMPLOYEES - createdEmployees;
      const childrenToCreate = Math.min(
        maxChildren - parent.childrenCount,
        remainingToCreate
      );

      for (let i = 0; i < childrenToCreate; i++) {
        const empName = `Employee_${createdEmployees + 1}`;
        const empEmail = `employee${createdEmployees + 1}@company.com`;
        const empRole = getRoleByDepth(parent.depth + 1);
        const empPassword = "password123";

        const newEmp = await registerEmployee(
          empName,
          empEmail,
          empPassword,
          empRole,
          parent.id,
          transaction
        );

        queue.push({
          id: newEmp.id,
          depth: parent.depth + 1,
          childrenCount: 0,
        });
        createdEmployees++;

        parent.childrenCount++;
        if (createdEmployees >= TOTAL_EMPLOYEES) break;
      }

      if (parent.childrenCount < maxChildren) {
        queue.unshift(parent);
      }
    }

    await transaction.commit();
    console.log(
      `✅ Seeded ${TOTAL_EMPLOYEES} employees with hierarchical structure.`
    );
  } catch (err) {
    console.error("❌ Failed to seed employees:", err);
  }
}

seedHierarchy();

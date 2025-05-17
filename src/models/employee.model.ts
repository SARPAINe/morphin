import { Model, DataTypes } from "sequelize";
import sequelize from "../database";
import { EmployeeRole } from "../enums/employeeRole.enum";

class Employee extends Model {
  public id!: number;
  public parentId!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: EmployeeRole; // Change role property to use EmployeeRole enum
  public isDeleted?: boolean;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "employees",
        key: "id",
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(EmployeeRole)),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "employees",
    modelName: "Employee",
    timestamps: true,
  }
);

export default Employee;

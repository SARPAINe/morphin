import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database";

class EmployeeClosure extends Model {
  public ancestor_id!: number;
  public descendant_id!: number;
  public depth!: number;
}

EmployeeClosure.init(
  {
    ancestor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "employees",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    descendant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "employees",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EmployeeClosure",
    tableName: "employees_closure",
    timestamps: true,
    indexes: [
      {
        fields: ["ancestor_id"],
      },
    ],
  }
);

export default EmployeeClosure;

import Employee from "./employee.model";
import EmployeeClosure from "./employeeClosure.model";

export const defineAssociations = () => {
  // EmployeeClosure.ancestor_id -> Employee.id
  EmployeeClosure.belongsTo(Employee, {
    as: "ancestor",
    foreignKey: "ancestor_id",
  });

  // EmployeeClosure.descendant_id -> Employee.id
  EmployeeClosure.belongsTo(Employee, {
    as: "descendant",
    foreignKey: "descendant_id",
  });
};

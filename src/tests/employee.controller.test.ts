import request from "supertest";
import app from "../app";
import sequelize from "../database";
import { Employee, EmployeeClosure } from "../models";
import { EmployeeRole } from "../enums/employeeRole.enum";

let token: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await EmployeeClosure.destroy({ where: {} });
  await Employee.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe("EmployeeController", () => {
  let ceo: any, manager: any, engineer: any;

  beforeEach(async () => {
    // Register CEO
    let res = await request(app).post("/api/v1/auth/register").send({
      name: "CEO",
      email: "ceo@example.com",
      password: "password123",
      role: EmployeeRole.CEO,
      parent_id: null,
    });
    ceo = res.body.data;

    // Login as CEO and save the token
    res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ceo@example.com", password: "password123" });
    token = res.body.data.token;

    // Register Manager
    res = await request(app)
      .post("/api/v1/auth/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Manager",
        email: "manager@example.com",
        password: "password123",
        role: EmployeeRole.ProjectManager,
        parent_id: ceo.id,
      });
    manager = res.body.data;

    // Register Engineer
    res = await request(app)
      .post("/api/v1/auth/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Engineer",
        email: "engineer@example.com",
        password: "password123",
        role: EmployeeRole.SoftwareEng,
        parent_id: manager.id,
      });
    engineer = res.body.data;

    // Login as CEO and save the token
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "ceo@example.com", password: "password123" });
    token = loginRes.body.data.token;
  });

  it("should get all employees", async () => {
    const res = await request(app)
      .get("/api/v1/employees")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("should get employee by id", async () => {
    const res = await request(app)
      .get(`/api/v1/employees/${ceo.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("email", "ceo@example.com");
  });

  it("should return 404 for non-existent employee", async () => {
    const res = await request(app)
      .get("/api/v1/employees/99999")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it("should return employee not found error", async () => {
    const res = await request(app)
      .get("/api/v1/employees/99999")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body).toHaveProperty("message", "Employee not found");
  });

  it("should get subordinates for a manager", async () => {
    const res = await request(app)
      .get(`/api/v1/employees/subordinates/${manager.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get managers for an engineer", async () => {
    const res = await request(app)
      .get(`/api/v1/employees/managers/${engineer.id}`)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

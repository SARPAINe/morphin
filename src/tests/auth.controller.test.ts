import request from "supertest";
import app from "../app";
import { EmployeeRole } from "../enums/employeeRole.enum";
import sequelize from "../database";
import { EmployeeClosure, Employee } from "../models";

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Recreate tables for a clean slate
});

afterEach(async () => {
  await EmployeeClosure.destroy({ where: {} });
  await Employee.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe("AuthController", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new employee", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        role: EmployeeRole.SoftwareEng,
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Employee registered successfully");
      expect(res.body.data).toHaveProperty("email", "testuser@example.com");
    });

    it("should not register with missing fields", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials", async () => {
      // First, register the user
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "testlogin@example.com",
        password: "password123",
        role: EmployeeRole.SoftwareEng,
      });

      // Then, login
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "testlogin@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.data).toHaveProperty("token");
    });

    it("should not login with invalid credentials", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should logout successfully", async () => {
      // First, register the user
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "testlogin@example.com",
        password: "password123",
        role: EmployeeRole.SoftwareEng,
      });

      // Then, login and capture the cookie
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "testlogin@example.com",
        password: "password123",
      });

      const cookies = loginRes.headers["set-cookie"];

      // Now, send the cookie with the logout request
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });
});

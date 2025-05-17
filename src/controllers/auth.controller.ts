import { Request, Response } from "express";
import { authService } from "../services";
import { ApiResponse } from "../utils";
import { logInfo, logError } from "../utils/logger";

class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, parent_id } = req.body;
      const employee = await authService.register(
        name,
        email,
        password,
        role,
        parent_id
      );
      logInfo("User registered", { employeeId: employee.id, email });
      return res
        .status(201)
        .json(new ApiResponse("Registration successful", employee));
    } catch (error) {
      logError("Registration failed", { email: req.body.email });
      throw error;
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      logInfo("User logged in", { email: req.body.email });

      const { token } = result;

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 3600000),
      });

      return res.json(new ApiResponse("Login successful", { token }));
    } catch (error) {
      logError("Login failed", { email: req.body.email });
      throw error;
    }
  }

  public logout(_req: Request, res: Response) {
    logInfo("User logged out");
    res.clearCookie("token");
    return res
      .status(200)
      .json(new ApiResponse("Logged out successfully", null));
  }
}

export const authController = new AuthController();

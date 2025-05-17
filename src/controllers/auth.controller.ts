import { Request, Response } from "express";
import { authService } from "../services";
import { ApiResponse } from "../utils";

class AuthController {
  public async register(req: Request, res: Response) {
    const { email, password, name, role, parent_id } = req.body;
    const employee = await authService.register(
      name,
      email,
      password,
      role,
      parent_id
    );
    return res
      .status(201)
      .json(new ApiResponse("Employee registered successfully", employee));
  }

  public async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { token } = await authService.login(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 3600000),
    });

    return res.json(new ApiResponse("Login successful", { token }));
  }

  public logout(_req: Request, res: Response) {
    res.clearCookie("token");
    return res
      .status(200)
      .json(new ApiResponse("Logged out successfully", null));
  }
}

export const authController = new AuthController();

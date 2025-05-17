import { Router } from "express";
import { isAuth, validate } from "../middlewares";
import { authController } from "../controllers";
import Joi from "joi";
import { EmployeeRole } from "../enums/employeeRole.enum";

const router = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().min(6).required().label("Password"),
});

const registerSchema = loginSchema.keys({
  name: Joi.string().min(2).max(50).required().label("Name"),
  role: Joi.string()
    .valid(...Object.values(EmployeeRole))
    .required()
    .label("Role"),
});

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", isAuth, authController.logout);

export default router;

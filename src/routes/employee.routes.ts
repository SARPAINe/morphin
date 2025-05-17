import { Router } from "express";
import { isAuth, validate } from "../middlewares";
import { employeeController } from "../controllers";

const router = Router();

router.get("/", isAuth, employeeController.getAll);
router.get("/:id", isAuth, employeeController.getById);
router.get("/subordinates/:id", employeeController.getSubordinates);
router.get("/managers/:id", employeeController.getManagers);
export default router;

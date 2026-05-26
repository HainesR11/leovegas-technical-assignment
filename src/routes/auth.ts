import { Router } from "express";
import { loginController } from "../controllers/authController";

const router = Router();

router.post("/login", (req, res) => loginController(req, res));

export default router;

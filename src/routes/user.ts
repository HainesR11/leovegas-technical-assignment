import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
} from "../controllers/userController";
import { userSchema } from "../schema/userSchema";
import validateUser from "../middleware/userValidation";

const router = Router();

router.get("/", (req, res) => getAllUsers(req, res));
router.get("/:id", (req, res) => getUserById(req, res));
router.patch("/:id", validateUser(userSchema), (req, res) =>
  updateUserById(req, res),
);

export default router;

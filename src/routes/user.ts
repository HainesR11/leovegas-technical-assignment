import { Router } from "express";
import {
  deleteUserById,
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
router.delete("/:id", (req, res) => deleteUserById(req, res));

export default router;

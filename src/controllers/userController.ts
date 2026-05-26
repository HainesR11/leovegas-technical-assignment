import pool from "../services/postgresDatabase";
import { Response, Request } from "express";
import { postgresObjectSeperator } from "../utils/keySeparation";

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users",
    );
    return res.status(200).json(result.rows).send();
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal Server Error" }).send();
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (req.user?.role !== "Admin" && req.user?.userId !== parseInt(userId)) {
    return res
      .status(403)
      .json({
        error: "Forbidden",
        message: "User not permitted to access resource",
      })
      .send();
  }

  const results = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
    [userId],
  );

  if (results.rows.length === 0) {
    return res.status(404).json({ error: "User not found" }).send();
  }

  return res.status(200).json(results.rows[0]).send();
};

export const updateUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const { keys, values } = postgresObjectSeperator({ props: req.body });

  if (req.user?.role !== "Admin" && req.user?.userId !== parseInt(userId)) {
    return res
      .status(403)
      .json({
        error: "Forbidden",
        message: "User not permitted to access resource",
      })
      .send();
  }

  const results = await pool.query(
    `UPDATE users SET ${keys.join(", ")} WHERE id = $${keys.length + 1} RETURNING id, name, email, role, created_at`,
    [...values, parseInt(userId)],
  );

  if (results.rows.length === 0) {
    return res.status(404).json({ error: "User not found" }).send();
  }

  return res.status(200).json(results.rows[0]).send();
};

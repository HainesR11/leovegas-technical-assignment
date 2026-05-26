import pool from "../services/postgresDatabase";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  pool.query(
    "SELECT * FROM users where email = $1",
    [email],
    (error, result) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal Server Error" }).send();
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" }).send();
      }

      const user = result.rows[0];

      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" }).send();
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET ?? "default_secret",
        { expiresIn: "1h" },
      );

      return res
        .status(200)
        .json({
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          accessToken: accessToken,
        })
        .send();
    },
  );
};

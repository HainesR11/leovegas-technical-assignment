import { Express } from "express";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";

const useRoutes = (app: Express) => {
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/auth", authRouter);
};

export default useRoutes;

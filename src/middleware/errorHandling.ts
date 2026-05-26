import { NextFunction, Request, Response } from "express";

const errorHandlingMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.on("error", (error) => {
    console.error("Request error:", error);
    return res.status(500).json({ error: "Internal Server Error" }).send();
  });

  next();
};

export default errorHandlingMiddleware;

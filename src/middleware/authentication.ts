import express from "express";

import { useLogger } from "../utils/logger";
import jwt from "jsonwebtoken";
import { TUser } from "../types/types";

const NONAUTHENTICATION_PATHS = ["/api/v1/auth"];
const AuthHeader = "x-auth-token";

const middlewear = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const logger = useLogger();

  const requiresAuthentication = NONAUTHENTICATION_PATHS.some(
    (url) => !req.url.includes(url),
  );

  if (requiresAuthentication) {
    const token = req.header(AuthHeader);

    if (!token) {
      logger.error({
        message: "[Authentication] Header is missing authentication token",
        key: "http.header.auth",
      });
      return res
        .status(401)
        .json({
          message: "[Authentication] Header is missing authentication token",
          key: "http.header.auth",
        })
        .send();
    }

    try {
      const user = jwt.verify(
        token,
        process.env.JWT_SECRET ?? "default_secret",
      ) as TUser;

      req.user = user;

      return next();
    } catch {
      logger.error({
        message: "[Authentication] Invalid authentication token",
        key: "http.header.auth",
      });
      return res
        .status(403)
        .json({
          message: "[Authentication] Invalid authentication token",
          key: "http.header.auth",
        })
        .send();
    }
  } else {
    return next();
  }
};

export default middlewear;

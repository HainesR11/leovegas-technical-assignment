import { useLogger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";

const isObjectEmpty = (obj: object) => {
  if (Object.keys(obj).length === 0) {
    return true;
  }
  return false;
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  const logger = useLogger();
  logger.log("info", {
    Time: new Date().toUTCString(),
    Enpoint: req.path,
    Status: res.statusCode,
    user: req.user,
    ...(!isObjectEmpty(req.body) && { Body: req.body }),
    ...(!isObjectEmpty(req.params) && { Body: req.params }),
    ...(!isObjectEmpty(req.query) && { Body: req.query }),
  });
  next();
};

export default logger;

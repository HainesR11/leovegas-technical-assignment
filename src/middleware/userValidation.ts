import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const validateUser = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove unknown properties
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      console.log("Validation errors:", errors);

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    req.body = value;
    return next();
  };
};

export default validateUser;

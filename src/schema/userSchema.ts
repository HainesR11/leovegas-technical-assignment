import Joi from "joi";

export const userSchema: Joi.ObjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("User", "Admin").default("user"),
});

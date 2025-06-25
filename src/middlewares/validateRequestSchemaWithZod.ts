import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { RequestResponse } from "../utils/apiResponse";

export const validateRequestSchemaWithZod =
  (schema: ZodSchema<any>, property: "body" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      RequestResponse(res, 400, false, "Validation failed", { errors });
      return;
    }
    next();
  };

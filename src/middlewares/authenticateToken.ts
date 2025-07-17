import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/jwt/jwt";
import { AuthenticatedRequest } from "../auth/types";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Missing bearer token" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
    return;
  }
};

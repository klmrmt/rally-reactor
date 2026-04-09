import { Request, Response, NextFunction } from "express";
import {
  verifyParticipantToken,
  ParticipantTokenPayload,
} from "../auth/participantToken";

export interface ParticipantRequest extends Request {
  participant?: ParticipantTokenPayload;
}

export const authenticateParticipant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Missing participant token" });
    return;
  }

  const decoded = verifyParticipantToken(token);
  if (!decoded) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired participant token" });
    return;
  }

  const hexId = req.params.hexId;
  if (hexId) {
    // We'll verify rally association in the controller since we need the DB lookup
  }

  (req as ParticipantRequest).participant = decoded;
  next();
};

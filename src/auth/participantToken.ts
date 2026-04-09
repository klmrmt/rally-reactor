import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface ParticipantTokenPayload {
  participantId: string;
  rallyId: string;
  displayName: string;
  iat?: number;
  exp?: number;
}

export const generateParticipantToken = (
  participantId: string,
  rallyId: string,
  displayName: string
): string => {
  return jwt.sign(
    { participantId, rallyId, displayName } as ParticipantTokenPayload,
    config.jwtSecret,
    { expiresIn: "24h" }
  );
};

export const verifyParticipantToken = (
  token: string
): ParticipantTokenPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as ParticipantTokenPayload;
  } catch {
    return null;
  }
};

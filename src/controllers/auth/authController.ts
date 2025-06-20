import { Request, Response } from "express";

export const createAndSendMFACode = (req: Request, res: Response) => {
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) {
    res.status(400).json({ message: "Phone number is required" });
    return;
  }
  // Simulate sending an MFA code
  const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
  res.status(200).json({
    message: "MFA code sent successfully",
    mfaCode,
  });
};

export const verifyMFACode = (req: Request, res: Response) => {
  const { phoneNumber, mfaCode } = req.body || {};
  if (!phoneNumber || !mfaCode) {
    res.status(400).json({ message: "Phone number and MFA code are required" });
    return;
  }
  // Simulate MFA code verification
  if (mfaCode === "123456") {
    res.status(200).json({ message: "MFA code verified successfully" });
    return;
  }
  res.status(401).json({ message: "Invalid MFA code" });
};

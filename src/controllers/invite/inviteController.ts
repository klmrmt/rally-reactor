import { Request, Response } from "express";

export const getInvite = (req: Request, res: Response) => {
  const inviteId = req.query.inviteId;
  if (!inviteId) {
    res.status(400).json({ message: "Invite ID is required" });
    return;
  }

  // Fetch Data Simulation
  res.json({
    message: `Invite details for ID ${inviteId}`,
    inviteDetails: {
      id: inviteId,
      name: "Sample Invite",
      status: "Pending",
    },
  });
};

export const postInvite = (req: Request, res: Response): void => {
  if (!req.body.groupName) {
    res.status(400).json({ message: "Name is required" });
  }
  res.json({
    message: `Invite created for ${req.body.groupName}`,
    inviteId: Math.floor(Math.random() * 1000), // Simulating an invite ID
  });
};

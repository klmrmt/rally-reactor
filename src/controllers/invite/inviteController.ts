import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";

export const getInvite = (req: AuthenticatedRequest, res: Response) => {
  const inviteId = req.query.inviteId;
  // const user = req.user;
  // console.log(`User ID: ${JSON.stringify(user)}, Invite ID: ${inviteId}`);

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

export const postInvite = (req: AuthenticatedRequest, res: Response): void => {
  // const user = req.user;
  // console.log(`User ID: ${JSON.stringify(user)}`);
  res.json({
    message: `Invite created for ${req.body.groupName}`,
    inviteId: Math.floor(Math.random() * 1000), // Simulating an invite ID
  });
};

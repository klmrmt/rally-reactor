import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { createRally, getRallyByInviteHexId } from "../../models/RallyModel";
import {
  GetInviteQuery,
  PostInviteBody,
} from "../../schemas/inviteRequestSchemas";

export const getInvite = async (
  req: AuthenticatedRequest & { query?: GetInviteQuery },
  res: Response
) => {
  const inviteId = req.query.inviteId;

  try {
    const result = await getRallyByInviteHexId(inviteId);

    if (!result) {
      res.status(404).json({ error: "Invite not found" });
      return;
    }

    res.status(200).json({
      message: `Invite details for ID ${inviteId}`,
      data: {
        ...result,
      },
    });
    return;
  } catch (err) {
    console.error("Error fetching invite:", err);
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
};

export const postInvite = async (
  req: AuthenticatedRequest & { body: PostInviteBody },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { groupName, callToRally, hangoutDateTime } = req.body;

  try {
    const createdRally = await createRally(
      req.user.user_id,
      groupName,
      callToRally,
      new Date(hangoutDateTime)
    );

    res.status(201).json({
      message: `Invite created for ${groupName}`,
      data: {
        ...createdRally,
      },
    });
    return;
  } catch (error) {
    console.error("Error creating rally:", error);
    res.status(500).json({ error: "Failed to create invite" });
    return;
  }
};

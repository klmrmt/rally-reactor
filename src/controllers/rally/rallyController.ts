import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { createRally, getRallyByRallyHexId } from "../../models/RallyModel";
import {
  GetRallyType,
  CreateRallyType,
} from "../../schemas/rallyRequestSchemas";

export const getRally = async (
  req: AuthenticatedRequest & { query?: GetRallyType },
  res: Response
) => {
  const rallyId = req.query.rallyId;

  try {
    const result = await getRallyByRallyHexId(rallyId);

    if (!result) {
      res.status(404).json({ error: "Rally not found" });
      return;
    }

    res.status(200).json({
      message: `Rally details for ID ${rallyId}`,
      data: {
        ...result,
      },
    });
    return;
  } catch (err) {
    console.error("Error fetching Rally:", err);
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
};

export const postRally = async (
  req: AuthenticatedRequest & { body: CreateRallyType },
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
      message: `Rally created for ${groupName}`,
      data: {
        ...createdRally,
      },
    });
    return;
  } catch (error) {
    console.error("Error creating rally:", error);
    res.status(500).json({ error: "Failed to create rally" });
    return;
  }
};

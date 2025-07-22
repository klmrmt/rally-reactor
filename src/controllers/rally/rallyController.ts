import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { createRally, getRallyByRallyHexId } from "../../models/RallyModel";
import {
  GetRallyType,
  CreateRallyType,
} from "../../schemas/rallyRequestSchemas";

// This getRally function retrieves rally details by its unique hex ID.
export const getRally = async (
  req: AuthenticatedRequest & { query?: GetRallyType },
  res: Response
) => {
  const rallyId = req.query.rallyId;

  try {
    const result = await getRallyByRallyHexId(rallyId);

    if (!result) {
      res.status(404).json({ success: false, error: "Rally not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Rally details for ID ${rallyId}`,
      data: {
        ...result,
      },
    });
    return;
  } catch (err) {
    console.error("Error fetching Rally:", err);
    res.status(500).json({ success: false, error: "Something went wrong" });
    return;
  }
};

// This postRally function creates a new rally with the provided details.
export const postRally = async (
  req: AuthenticatedRequest & { body: CreateRallyType },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    res.status(401).json({ success: false, error: "Unauthorized" });
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

    res.status(200).json({
      success: true,
      message: `Rally created for ${groupName}`,
      data: {
        ...createdRally,
      },
    });
    return;
  } catch (error) {
    console.error("Error creating rally:", error);
    res.status(500).json({ success: false, error: "Failed to create rally" });
    return;
  }
};

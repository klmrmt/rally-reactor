import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { createRally, getRallyByRallyHexId } from "../../models/RallyModel";
import { RequestResponse } from "../../utils/apiResponse";
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
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    RequestResponse(res, 200, true, `Rally details for ID ${rallyId}`, {
      ...result,
    });
    return;
  } catch (err) {
    console.error("Error fetching Rally:", err);
    RequestResponse(res, 500, false, "Something went wrong");
    return;
  }
};

// This postRally function creates a new rally with the provided details.
export const postRally = async (
  req: AuthenticatedRequest & { body: CreateRallyType },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
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

    RequestResponse(res, 201, true, `Rally created for ${groupName}`, {
      ...createdRally,
    });
    return;
  } catch (error) {
    console.error("Error creating rally:", error);
    RequestResponse(res, 500, false, "Failed to create rally");
    return;
  }
};

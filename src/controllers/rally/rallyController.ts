import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import {
  createRally,
  getRallyByRallyHexId,
  updateRally,
} from "../../models/RallyModel";
import { deleteDraft } from "../../models/DraftModel";
import { RequestResponse } from "../../utils/apiResponse";
import {
  GetRallyType,
  CreateRallyType,
  UpdateRallyType,
} from "../../schemas/rallyRequestSchemas";
import { trackEvent } from "../../utils/analytics";

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

export const postRally = async (
  req: AuthenticatedRequest & { body: CreateRallyType },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const { groupName, callToRally, hangoutDateTime, location, radiusMiles, latitude, longitude, votingDurationMinutes, draftId } = req.body;

  try {
    const createdRally = await createRally(
      req.user.user_id,
      groupName,
      callToRally || "",
      new Date(hangoutDateTime),
      location,
      radiusMiles,
      latitude,
      longitude,
      votingDurationMinutes
    );

    if (draftId) {
      deleteDraft(draftId, req.user.user_id).catch((err) =>
        console.error("Failed to clean up draft after rally creation:", err)
      );
    }

    RequestResponse(res, 201, true, `Rally created for ${groupName}`, {
      ...createdRally,
    });

    trackEvent("rally.created", {
      rallyId: createdRally.id,
      hexId: createdRally.hexId,
      userId: req.user!.user_id,
      hasLocation: !!location,
      hasRadiusMiles: !!radiusMiles,
    });

    return;
  } catch (error) {
    console.error("Error creating rally:", error);
    RequestResponse(res, 500, false, "Failed to create rally");
    return;
  }
};

export const patchRally = async (
  req: AuthenticatedRequest & { body: UpdateRallyType },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const { hexId } = req.params;
  const { groupName, callToRally, hangoutDateTime, location, radiusMiles, latitude, longitude } = req.body;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.groupLeaderId !== req.user.user_id) {
      RequestResponse(res, 403, false, "Only the group leader can edit the rally");
      return;
    }

    if (rally.status !== "voting") {
      RequestResponse(res, 400, false, "Rally can only be edited while voting is open");
      return;
    }

    const updated = await updateRally(rally.id, req.user.user_id, {
      groupName,
      callToAction: callToRally,
      scheduledTime: hangoutDateTime ? new Date(hangoutDateTime as string) : undefined,
      location: location !== undefined ? location : undefined,
      radiusMiles: radiusMiles !== undefined ? radiusMiles : undefined,
      latitude: latitude !== undefined ? latitude : undefined,
      longitude: longitude !== undefined ? longitude : undefined,
    });

    if (!updated) {
      RequestResponse(res, 500, false, "Failed to update rally");
      return;
    }

    RequestResponse(res, 200, true, "Rally updated", { ...updated });

    trackEvent("rally.updated", {
      rallyId: updated.id,
      hexId: updated.hexId,
      userId: req.user.user_id,
    });
  } catch (error) {
    console.error("Error updating rally:", error);
    RequestResponse(res, 500, false, "Failed to update rally");
  }
};

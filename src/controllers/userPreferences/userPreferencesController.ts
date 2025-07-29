import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import {
  createUserPreferences,
  getUserPreferencesByUserIdAndRallyId,
  updateUserPreferences,
} from "../../models/UserPreferencesModel";
import { getRallyByRallyHexId } from "../../models/RallyModel";
import { RequestResponse } from "../../utils/apiResponse";
import {
  GetUserPreferencesType,
  CreateUserPreferencesType,
} from "../../schemas/userPreferencesRequestSchemas";

// This getUserPreferences function retrieves user preferences by rally ID.
export const getUserPreferences = async (
  req: AuthenticatedRequest & { query?: GetUserPreferencesType },
  res: Response
) => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const rallyId = req.query.rally_id;

  try {
    // First validate that the rally exists
    const rally = await getRallyByRallyHexId(rallyId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    const result = await getUserPreferencesByUserIdAndRallyId(
      req.user.user_id,
      rallyId
    );

    if (!result) {
      RequestResponse(res, 404, false, "User preferences not found");
      return;
    }

    RequestResponse(res, 200, true, `User preferences for rally ${rallyId}`, {
      ...result,
    });
    return;
  } catch (err) {
    console.error("Error fetching user preferences:", err);
    RequestResponse(res, 500, false, "Something went wrong");
    return;
  }
};

// This postUserPreferences function creates or updates user preferences.
export const postUserPreferences = async (
  req: AuthenticatedRequest & { body: CreateUserPreferencesType },
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const { rally_id, cost_level, vibe, location_radius } = req.body;

  try {
    // First validate that the rally exists
    const rally = await getRallyByRallyHexId(rally_id);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    // TODO: Add validation to check if user has accepted/joined the rally
    // This would require implementing a rally participants system
    // For now, we'll allow any authenticated user to submit preferences

    // Check if preferences already exist for this user and rally
    const existingPreferences = await getUserPreferencesByUserIdAndRallyId(
      req.user.user_id,
      rally_id
    );

    let result;
    if (existingPreferences) {
      // Update existing preferences
      result = await updateUserPreferences(
        req.user.user_id,
        rally_id,
        cost_level,
        vibe,
        location_radius
      );
    } else {
      // Create new preferences
      result = await createUserPreferences(
        req.user.user_id,
        rally_id,
        cost_level,
        vibe,
        location_radius
      );
    }

    const action = existingPreferences ? "updated" : "created";
    RequestResponse(
      res,
      existingPreferences ? 200 : 201,
      true,
      `User preferences ${action} for rally ${rally_id}`,
      {
        ...result,
      }
    );
    return;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    RequestResponse(res, 500, false, "Failed to save user preferences");
    return;
  }
}; 
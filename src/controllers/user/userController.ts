import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { getUserFullById, updateUserDisplayName, getRalliesForUser } from "../../models/UserModel";
import { RequestResponse } from "../../utils/apiResponse";
import { UpdateMeBody } from "../../schemas/userSchemas";

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.user_id;
  try {
    const user = await getUserFullById(userId);
    if (!user) {
      RequestResponse(res, 404, false, "User not found");
      return;
    }
    RequestResponse(res, 200, true, "User profile", {
      userId: user.userId,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    RequestResponse(res, 500, false, "Failed to fetch profile");
  }
};

export const updateMe = async (
  req: AuthenticatedRequest & { body: UpdateMeBody },
  res: Response
): Promise<void> => {
  const userId = req.user!.user_id;
  const { displayName } = req.body;
  try {
    const user = await updateUserDisplayName(userId, displayName);
    if (!user) {
      RequestResponse(res, 404, false, "User not found");
      return;
    }
    RequestResponse(res, 200, true, "Profile updated", {
      userId: user.userId,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    RequestResponse(res, 500, false, "Failed to update profile");
  }
};

export const getMyRallies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.user_id;
  try {
    const rallies = await getRalliesForUser(userId);
    RequestResponse(res, 200, true, "User rallies", { rallies });
  } catch (err) {
    console.error("Error fetching user rallies:", err);
    RequestResponse(res, 500, false, "Failed to fetch rallies");
  }
};

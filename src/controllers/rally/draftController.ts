import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { RequestResponse } from "../../utils/apiResponse";
import {
  getDraftsByUser,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
} from "../../models/DraftModel";

export const listDrafts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  try {
    const drafts = await getDraftsByUser(req.user.user_id);
    RequestResponse(res, 200, true, "Drafts retrieved", { drafts });
  } catch (err) {
    console.error("Error listing drafts:", err);
    RequestResponse(res, 500, false, "Failed to list drafts");
  }
};

export const getDraft = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  try {
    const draft = await getDraftById(req.params.id, req.user.user_id);
    if (!draft) {
      RequestResponse(res, 404, false, "Draft not found");
      return;
    }
    RequestResponse(res, 200, true, "Draft retrieved", draft);
  } catch (err) {
    console.error("Error getting draft:", err);
    RequestResponse(res, 500, false, "Failed to get draft");
  }
};

export const postDraft = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const { step, data } = req.body;

  try {
    const draft = await createDraft(req.user.user_id, step ?? 0, data ?? {});
    RequestResponse(res, 201, true, "Draft created", draft);
  } catch (err) {
    console.error("Error creating draft:", err);
    RequestResponse(res, 500, false, "Failed to create draft");
  }
};

export const putDraft = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  const { step, data } = req.body;

  try {
    const draft = await updateDraft(
      req.params.id,
      req.user.user_id,
      step ?? 0,
      data ?? {}
    );
    if (!draft) {
      RequestResponse(res, 404, false, "Draft not found");
      return;
    }
    RequestResponse(res, 200, true, "Draft updated", draft);
  } catch (err) {
    console.error("Error updating draft:", err);
    RequestResponse(res, 500, false, "Failed to update draft");
  }
};

export const removeDraft = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user?.user_id) {
    RequestResponse(res, 401, false, "Unauthorized");
    return;
  }

  try {
    const deleted = await deleteDraft(req.params.id, req.user.user_id);
    if (!deleted) {
      RequestResponse(res, 404, false, "Draft not found");
      return;
    }
    RequestResponse(res, 200, true, "Draft deleted");
  } catch (err) {
    console.error("Error deleting draft:", err);
    RequestResponse(res, 500, false, "Failed to delete draft");
  }
};

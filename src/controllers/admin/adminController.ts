import { Response } from "express";
import { AuthenticatedRequest } from "../../auth/types";
import { getRallyByRallyHexId, updateRallyStatus } from "../../models/RallyModel";
import { createRecommendationsBatch } from "../../models/RecommendationModel";
import { RequestResponse } from "../../utils/apiResponse";
import { ManualRecommendationType } from "../../schemas/adminSchemas";

export const overrideRecommendations = async (
  req: AuthenticatedRequest & { body: ManualRecommendationType },
  res: Response
): Promise<void> => {
  const { hexId } = req.params;

  try {
    const rally = await getRallyByRallyHexId(hexId);
    if (!rally) {
      RequestResponse(res, 404, false, "Rally not found");
      return;
    }

    if (rally.groupLeaderId !== req.user?.user_id) {
      RequestResponse(res, 403, false, "Only the rally leader can override");
      return;
    }

    const items = req.body.recommendations.map((r: ManualRecommendationType["recommendations"][number]) => ({
      name: r.name,
      category: r.category,
      whyItFits: r.whyItFits,
      distanceLabel: r.distanceLabel,
      priceLevel: r.priceLevel,
      rating: r.rating,
      mapsUrl: r.mapsUrl,
      source: "manual",
    }));

    const saved = await createRecommendationsBatch(rally.id, items);
    await updateRallyStatus(rally.id, "picking");

    RequestResponse(res, 201, true, "Manual recommendations set", {
      recommendations: saved,
    });
  } catch (err) {
    console.error("Error overriding recommendations:", err);
    RequestResponse(res, 500, false, "Failed to set recommendations");
  }
};

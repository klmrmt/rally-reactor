import { getAggregatedVotes } from "../../models/ConstraintVoteModel";
import { getParticipantCount } from "../../models/ParticipantModel";
import { createRecommendationsBatch } from "../../models/RecommendationModel";
import { getRallyById, updateRallyStatus } from "../../models/RallyModel";
import {
  searchNearbyPlaces,
  budgetToGooglePriceRange,
  vibeToSearchKeywords,
  distanceToRadius,
} from "../services/googlePlaces";
import { rankAndExplain } from "../modules/activityRecommender";

export const generateRecommendationsForRally = async (
  rallyId: string
): Promise<void> => {
  const rally = await getRallyById(rallyId);
  if (!rally) throw new Error("Rally not found");

  const aggregatedVotes = await getAggregatedVotes(rallyId);
  if (aggregatedVotes.totalVotes === 0) {
    throw new Error("No votes to generate recommendations from");
  }

  const groupSize = await getParticipantCount(rallyId);
  const location = rally.location || "Chicago, IL";
  const coordinates = rally.latitude && rally.longitude
    ? { lat: rally.latitude, lng: rally.longitude }
    : undefined;

  const priceRange = budgetToGooglePriceRange(aggregatedVotes.budget);
  const keywords = vibeToSearchKeywords(aggregatedVotes.vibes);
  const voteRadius = distanceToRadius(aggregatedVotes.distance);

  const milesToMeters = (miles: number) => Math.round(miles * 1609.34);
  const radius = rally.radiusMiles
    ? Math.min(milesToMeters(rally.radiusMiles), voteRadius)
    : voteRadius;

  const allCandidates = [];
  for (const keyword of keywords.slice(0, 3)) {
    const places = await searchNearbyPlaces({
      location,
      coordinates,
      radius,
      keyword,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
    });
    allCandidates.push(...places);
  }

  const uniqueCandidates = Array.from(
    new Map(allCandidates.map((p) => [p.placeId, p])).values()
  );

  const topCandidates = uniqueCandidates
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 10);

  const scheduledTime = rally.scheduledTime;
  const dayOfWeek = scheduledTime.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const timeOfDay = scheduledTime.getHours() < 12
    ? "morning"
    : scheduledTime.getHours() < 17
    ? "afternoon"
    : "evening";
  const timeContext = `${dayOfWeek} ${timeOfDay}`;

  const ranked = await rankAndExplain(
    topCandidates,
    aggregatedVotes,
    groupSize,
    timeContext,
    location
  );

  if (ranked.length > 0) {
    await createRecommendationsBatch(
      rallyId,
      ranked.map((r) => ({
        ...r,
        rating: r.rating ?? undefined,
        imageUrl: r.imageUrl ?? undefined,
        latitude: r.latitude ?? undefined,
        longitude: r.longitude ?? undefined,
        address: r.address ?? undefined,
      }))
    );
  } else {
    console.error(`No recommendations generated for rally ${rallyId} — ${uniqueCandidates.length} candidates found from Google Places`);
  }

  await updateRallyStatus(rallyId, "picking");
};

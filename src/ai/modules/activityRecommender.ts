import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/config";
import { PlaceResult, priceLevelToSymbol, getPlaceMapsUrl, getPlacePhotoUrl } from "../services/googlePlaces";
import { AggregatedVotes } from "../../models/ConstraintVoteModel";

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
});

export type RankedRecommendation = {
  name: string;
  category: string;
  whyItFits: string;
  distanceLabel: string;
  priceLevel: string;
  rating: number | null;
  imageUrl: string | null;
  mapsUrl: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  source: string;
  externalId: string;
};

export const rankAndExplain = async (
  candidates: PlaceResult[],
  aggregatedVotes: AggregatedVotes,
  groupSize: number,
  timeContext: string,
  location: string
): Promise<RankedRecommendation[]> => {
  if (candidates.length === 0) return [];

  const candidateDescriptions = candidates.map((c, i) => ({
    index: i,
    name: c.name,
    rating: c.rating,
    priceLevel: priceLevelToSymbol(c.priceLevel),
    types: c.types.slice(0, 5).join(", "),
    address: c.address,
  }));

  const topVibes = Object.entries(aggregatedVotes.vibes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([v, count]) => `${v} (${count} votes)`)
    .join(", ");

  const budgetSummary = `$ (${aggregatedVotes.budget.low}), $$ (${aggregatedVotes.budget.mid}), $$$ (${aggregatedVotes.budget.high})`;
  const distanceSummary = `walk (${aggregatedVotes.distance.walk}), short drive (${aggregatedVotes.distance.shortDrive}), anywhere (${aggregatedVotes.distance.anywhere})`;

  const prompt = `You are Rally, a group outing assistant. A group of ${groupSize} people in ${location} want to go out ${timeContext}.

Group preferences (from ${aggregatedVotes.totalVotes} votes):
- Budget: ${budgetSummary}
- Vibes: ${topVibes}
- Distance: ${distanceSummary}

Here are ${candidates.length} venue candidates:
${JSON.stringify(candidateDescriptions, null, 2)}

Pick the best 5 venues for this group. For each, return a JSON array with objects containing:
- "index": the candidate index number
- "category": a short category like "Cocktail Bar", "Bowling Alley", etc.
- "whyItFits": a short, friendly explanation (1-2 sentences) referencing the group's actual votes, e.g. "4 out of 5 wanted chill vibes and this place nails it"
- "distanceLabel": "walking distance", "short drive", or "bit of a trek"

Return ONLY a JSON array, no markdown, no explanation outside the array.`;

  try {
    const result = await model.generateContent({
      systemInstruction: "You are a helpful group outing recommendation assistant. Always respond with valid JSON only.",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const content = result.response.text().trim();
    const jsonStr = content.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
    const parsed = JSON.parse(jsonStr);

    return parsed
      .filter((item: any) => item.index !== undefined && candidates[item.index])
      .map((item: any) => {
        const candidate = candidates[item.index];
        return {
          name: candidate.name,
          category: item.category || "Venue",
          whyItFits: item.whyItFits || "Great match for your group!",
          distanceLabel: item.distanceLabel || "nearby",
          priceLevel: priceLevelToSymbol(candidate.priceLevel),
          rating: candidate.rating,
          imageUrl: candidate.photoReference
            ? getPlacePhotoUrl(candidate.photoReference)
            : null,
          mapsUrl: getPlaceMapsUrl(candidate.placeId),
          latitude: candidate.location?.lat ?? null,
          longitude: candidate.location?.lng ?? null,
          address: candidate.address || null,
          source: "google_places",
          externalId: candidate.placeId,
        };
      });
  } catch (err) {
    console.error("Gemini ranking error:", err);
    return candidates.slice(0, 5).map((c) => ({
      name: c.name,
      category: c.types[0] || "Venue",
      whyItFits: "Looks like a solid pick for your group!",
      distanceLabel: "nearby",
      priceLevel: priceLevelToSymbol(c.priceLevel),
      rating: c.rating,
      imageUrl: c.photoReference ? getPlacePhotoUrl(c.photoReference) : null,
      mapsUrl: getPlaceMapsUrl(c.placeId),
      latitude: c.location?.lat ?? null,
      longitude: c.location?.lng ?? null,
      address: c.address || null,
      source: "google_places",
      externalId: c.placeId,
    }));
  }
};

import { config } from "../../config/config";

export type PlaceResult = {
  name: string;
  placeId: string;
  address: string;
  rating: number | null;
  priceLevel: number | null;
  types: string[];
  location: { lat: number; lng: number } | null;
  photoReference: string | null;
  openNow: boolean | null;
};

type NearbySearchParams = {
  location: string;
  coordinates?: { lat: number; lng: number };
  radius?: number;
  type?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
};

export const searchNearbyPlaces = async (
  params: NearbySearchParams
): Promise<PlaceResult[]> => {
  const { location, coordinates, radius = 5000, type, keyword, minPrice, maxPrice } = params;

  const geocoded = coordinates ?? await geocodeLocation(location);
  if (!geocoded) return [];

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  url.searchParams.set("location", `${geocoded.lat},${geocoded.lng}`);
  url.searchParams.set("radius", radius.toString());
  url.searchParams.set("key", config.google.placesApiKey);

  if (type) url.searchParams.set("type", type);
  if (keyword) url.searchParams.set("keyword", keyword);
  if (minPrice !== undefined)
    url.searchParams.set("minprice", minPrice.toString());
  if (maxPrice !== undefined)
    url.searchParams.set("maxprice", maxPrice.toString());

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.error("Google Places API error:", data.status, data.error_message);
    return [];
  }

  return (data.results || []).map(mapPlaceResult);
};

export const getPlaceMapsUrl = (placeId: string): string => {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
};

export const getPlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400
): string => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${config.google.placesApiKey}`;
};

async function geocodeLocation(
  location: string
): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", location);
  url.searchParams.set("key", config.google.placesApiKey);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== "OK" || !data.results?.length) {
    console.error("Geocoding failed for:", location, data.status);
    return null;
  }

  return data.results[0].geometry.location;
}

function mapPlaceResult(place: any): PlaceResult {
  return {
    name: place.name,
    placeId: place.place_id,
    address: place.vicinity || place.formatted_address || "",
    rating: place.rating ?? null,
    priceLevel: place.price_level ?? null,
    types: place.types || [],
    location: place.geometry?.location || null,
    photoReference: place.photos?.[0]?.photo_reference || null,
    openNow: place.opening_hours?.open_now ?? null,
  };
}

export function priceLevelToSymbol(level: number | null): string {
  if (level === null) return "$$";
  if (level <= 1) return "$";
  if (level <= 2) return "$$";
  return "$$$";
}

export function budgetToGooglePriceRange(budget: {
  low: number;
  mid: number;
  high: number;
}): { minPrice: number; maxPrice: number } {
  const total = budget.low + budget.mid + budget.high;
  if (total === 0) return { minPrice: 0, maxPrice: 4 };

  const weightedScore =
    (budget.low * 1 + budget.mid * 2 + budget.high * 3) / total;

  if (weightedScore < 1.5) return { minPrice: 0, maxPrice: 1 };
  if (weightedScore < 2.5) return { minPrice: 1, maxPrice: 2 };
  return { minPrice: 2, maxPrice: 4 };
}

export function vibeToSearchKeywords(
  vibes: Record<string, number>
): string[] {
  const sorted = Object.entries(vibes).sort((a, b) => b[1] - a[1]);
  const keywords: string[] = [];

  const vibeKeywordMap: Record<string, string[]> = {
    chill: ["lounge", "cafe", "chill"],
    active: ["bowling", "arcade", "sports bar", "activity"],
    drinks: ["bar", "cocktail", "brewery", "rooftop bar"],
    food: ["restaurant", "dining", "food hall"],
    outdoors: ["park", "rooftop", "patio", "outdoor dining"],
  };

  for (const [vibe] of sorted.slice(0, 2)) {
    const mapped = vibeKeywordMap[vibe];
    if (mapped) keywords.push(...mapped);
  }

  return keywords.length > 0 ? keywords : ["restaurant", "bar"];
}

export function distanceToRadius(distance: {
  walk: number;
  shortDrive: number;
  anywhere: number;
}): number {
  const total = distance.walk + distance.shortDrive + distance.anywhere;
  if (total === 0) return 5000;

  const weightedScore =
    (distance.walk * 1 + distance.shortDrive * 2 + distance.anywhere * 3) /
    total;

  if (weightedScore < 1.5) return 1500;
  if (weightedScore < 2.5) return 5000;
  return 15000;
}

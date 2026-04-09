import db from "../db";

export type Recommendation = {
  id: string;
  rallyId: string;
  name: string;
  category: string | null;
  whyItFits: string | null;
  distanceLabel: string | null;
  priceLevel: string | null;
  rating: number | null;
  imageUrl: string | null;
  mapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  source: string;
  externalId: string | null;
  createdAt: Date;
};

export const createRecommendation = async (
  rallyId: string,
  data: {
    name: string;
    category?: string;
    whyItFits?: string;
    distanceLabel?: string;
    priceLevel?: string;
    rating?: number;
    imageUrl?: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    source?: string;
    externalId?: string;
  }
): Promise<Recommendation> => {
  const query = `
    INSERT INTO recommendations (
      rally_id, name, category, why_it_fits, distance_label,
      price_level, rating, image_url, maps_url, latitude, longitude, address, source, external_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;
  const result = await db.query(query, [
    rallyId,
    data.name,
    data.category || null,
    data.whyItFits || null,
    data.distanceLabel || null,
    data.priceLevel || null,
    data.rating || null,
    data.imageUrl || null,
    data.mapsUrl || null,
    data.latitude ?? null,
    data.longitude ?? null,
    data.address || null,
    data.source || "google_places",
    data.externalId || null,
  ]);
  return mapRow(result.rows[0]);
};

export const createRecommendationsBatch = async (
  rallyId: string,
  items: Array<{
    name: string;
    category?: string;
    whyItFits?: string;
    distanceLabel?: string;
    priceLevel?: string;
    rating?: number;
    imageUrl?: string;
    mapsUrl?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    source?: string;
    externalId?: string;
  }>
): Promise<Recommendation[]> => {
  if (items.length === 0) return [];

  const values: any[] = [];
  const placeholders: string[] = [];
  let paramIdx = 1;

  for (const item of items) {
    placeholders.push(
      `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
    );
    values.push(
      rallyId,
      item.name,
      item.category || null,
      item.whyItFits || null,
      item.distanceLabel || null,
      item.priceLevel || null,
      item.rating || null,
      item.imageUrl || null,
      item.mapsUrl || null,
      item.latitude ?? null,
      item.longitude ?? null,
      item.address || null,
      item.source || "google_places",
      item.externalId || null
    );
  }

  const query = `
    INSERT INTO recommendations (
      rally_id, name, category, why_it_fits, distance_label,
      price_level, rating, image_url, maps_url, latitude, longitude, address, source, external_id
    ) VALUES ${placeholders.join(", ")}
    RETURNING *
  `;
  const result = await db.query(query, values);
  return result.rows.map(mapRow);
};

export const getRecommendationsByRallyId = async (
  rallyId: string
): Promise<Recommendation[]> => {
  const query = `
    SELECT * FROM recommendations
    WHERE rally_id = $1
    ORDER BY created_at ASC
  `;
  const result = await db.query(query, [rallyId]);
  return result.rows.map(mapRow);
};

export const getRecommendationById = async (
  id: string
): Promise<Recommendation | null> => {
  const query = `SELECT * FROM recommendations WHERE id = $1`;
  const result = await db.query(query, [id]);
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
};

function mapRow(row: any): Recommendation {
  return {
    id: row.id,
    rallyId: row.rally_id,
    name: row.name,
    category: row.category,
    whyItFits: row.why_it_fits,
    distanceLabel: row.distance_label,
    priceLevel: row.price_level,
    rating: row.rating ? parseFloat(row.rating) : null,
    imageUrl: row.image_url,
    mapsUrl: row.maps_url,
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    address: row.address || null,
    source: row.source,
    externalId: row.external_id,
    createdAt: row.created_at,
  };
}

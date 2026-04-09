import { z } from "zod";

export const manualRecommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().optional(),
        whyItFits: z.string().optional(),
        distanceLabel: z.string().optional(),
        priceLevel: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        mapsUrl: z.string().url().optional(),
      })
    )
    .min(1)
    .max(5),
});
export type ManualRecommendationType = z.infer<typeof manualRecommendationSchema>;

import { z } from "zod";

export const gallerySchema = z.object({
  id: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  filename: z.string(),
  title: z.string(),
  description: z.string(),
  inSlideView: z.boolean().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
});

export type Gallery = z.infer<typeof gallerySchema>;

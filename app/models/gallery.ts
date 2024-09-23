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

export const galleryFormSchema = z.object({
  title: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string({ required_error: "タイトルを入力してください" })
  ),
  description: z.string().optional(),
  inSlideView: z.custom<string | null>(),
});

export type GalleryForm = z.infer<typeof galleryFormSchema>;

export const galleryPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  filename: z.string(),
  width: z.number(),
  height: z.number(),
  inSlideView: z.boolean(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export type GalleryPayload = z.infer<typeof galleryPayloadSchema>;

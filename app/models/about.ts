import { z } from "zod";

export const aboutSchema = z.object({
  icon_object_path: z.string(),
  profile: z.string(),
  works: z.string(),
  /** TImestamp */
  created_at: z.number().optional(),
  /** TImestamp */
  updated_at: z.number().optional(),
});

export type About = z.infer<typeof aboutSchema>;

export const aboutFormSchema = z.object({
  profile: z.string(),
  works: z.string(),
});

export type AboutFormData = z.infer<typeof aboutFormSchema>;

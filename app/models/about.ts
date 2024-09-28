import { z } from "zod";

export const aboutSchema = z.object({
  icon_url: z.string(),
  profile: z.string(),
  works: z.string(),
});

export type About = z.infer<typeof aboutSchema>;

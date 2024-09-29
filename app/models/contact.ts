import { z } from "zod";

export const contactSchema = z.object({
  content: z.string(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

export type Contact = z.infer<typeof contactSchema>;

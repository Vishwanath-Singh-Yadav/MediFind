import { z } from "zod";

export const aiSymptomSearchSchema = z.object({
  query: z.string().min(3).max(500)
});

import { z } from "zod";
export const multiplicarInputSchema = z.object({
    numero1: z.number(),
    numero2: z.number()
});

import { z } from "zod";

export const placeBidSchema = z.object({
  bidAmount: z.string().min(1),
  txSignature: z.string().min(1),
});


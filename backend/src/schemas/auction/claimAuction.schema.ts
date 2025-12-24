import { z } from "zod";

export const claimAuctionSchema = z.object({
  txSignature: z.string().min(1),
});


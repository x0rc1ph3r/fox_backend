import { z } from "zod";

export const cancelGumballSchema = z.object({
  txSignature: z.string().min(1),
});


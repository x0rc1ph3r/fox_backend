import { z } from "zod";

export const raffleSchema = z.object({
    raffle: z.string().min(1),
    createdAt: z.date().optional(),
    endsAt: z.date(),
    createdBy: z.string().min(1),
    ticketPrice: z.number(),
    ticketSupply: z.number(),
    ticketTokenAddress: z.string().optional(),
    floor: z.number().optional(),
    val: z.number().optional(),
    ttv: z.number(),
    roi: z.number(),
    entriesAddress: z.string().min(1),
    prize: z.string().min(1),
    maxEntries: z.number(),
    numberOfWinners: z.number(),
});


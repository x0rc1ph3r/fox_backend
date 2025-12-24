import { z } from "zod";

export const addPrizeSchema = z.object({
  prizeIndex: z.number().int().min(0),
  isNft: z.boolean().default(false),
  
  // Token/NFT details
  mint: z.string().min(1),
  name: z.string().optional(),
  symbol: z.string().optional(),
  image: z.string().optional(),
  decimals: z.number().int().optional(),
  
  // Prize amounts
  totalAmount: z.string().min(1), // BigInt as string
  prizeAmount: z.string().min(1), // BigInt as string
  quantity: z.number().int().gt(0),
  
  // For NFTs - floor price used for buy back calculation
  floorPrice: z.string().optional(), // BigInt as string
  
  txSignature: z.string().min(1),
});

export const addMultiplePrizesSchema = z.object({
  prizes: z.array(z.object({
    prizeIndex: z.number().int().min(0),
    isNft: z.boolean().default(false),
    mint: z.string().min(1),
    name: z.string().optional(),
    symbol: z.string().optional(),
    image: z.string().optional(),
    decimals: z.number().int().optional(),
    totalAmount: z.string().min(1),
    prizeAmount: z.string().min(1),
    quantity: z.number().int().gt(0),
    floorPrice: z.string().optional(),
  })),
  txSignature: z.string().min(1),
});

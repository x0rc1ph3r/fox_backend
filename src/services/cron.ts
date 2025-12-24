import cron from "node-cron";
import prismaClient from "../database/client";
import logger from "../utils/logger";
import { announceWinners } from "./solanaconnector";
import { PublicKey } from "@solana/web3.js";


function selectRandomWinners(
  entries: { userAddress: string; quantity: number }[],
  numberOfWinners: number
): string[] {
  if (entries.length === 0) return [];

  const weightedPool: string[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.quantity; i++) {
      weightedPool.push(entry.userAddress);
    }
  }

  const uniqueParticipants = [...new Set(entries.map((e) => e.userAddress))];

  if (uniqueParticipants.length <= numberOfWinners) {
    return uniqueParticipants;
  }

  for (let i = weightedPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
  }

  const winners: Set<string> = new Set();
  let index = 0;

  while (winners.size < numberOfWinners && index < weightedPool.length) {
    winners.add(weightedPool[index]);
    index++;
  }

  if (winners.size < numberOfWinners) {
    for (const participant of uniqueParticipants) {
      if (!winners.has(participant)) {
        winners.add(participant);
        if (winners.size >= numberOfWinners) break;
      }
    }
  }

  return Array.from(winners);
}


async function processExpiredRaffles(): Promise<void> {
  const now = new Date();

  try {
    const expiredRaffles = await prismaClient.raffle.findMany({
      where: {
        state: "Active",
        endsAt: {
          lte: now,
        },
        winnerPicked: false,
      },
      include: {
        raffleEntries: true,
      },
    });

    if (expiredRaffles.length === 0) {
      return;
    }

    logger.log(
      `[CRON] Found ${expiredRaffles.length} expired raffle(s) to process`
    );

    for (const raffle of expiredRaffles) {
      try {
        await prismaClient.$transaction(async (tx) => {
          // Check if raffle has any entries
          if (raffle.raffleEntries.length === 0 || raffle.ticketSold === 0) {
            // No entries - raffle failed
            await tx.raffle.update({
              where: { id: raffle.id },
              data: {
                state: "FailedEnded",
                winnerPicked: true,
              },
            });
            logger.log(
              `[CRON] Raffle ${raffle.id} ended as FailedEnded (no entries)`
            );
            return;
          }

          // Select random winners based on entry weights
          const winnerAddresses = selectRandomWinners(
            raffle.raffleEntries,
            raffle.numberOfWinners
          );
          logger.log(`[CRON] Winner addresses: ${winnerAddresses.join(", ")}`);
          if (winnerAddresses.length === 0) {
            await tx.raffle.update({
              where: { id: raffle.id },
              data: {
                state: "FailedEnded",
                winnerPicked: true,
              },
            });
            logger.log(
              `[CRON] Raffle ${raffle.id} ended as FailedEnded (no valid winners)`
            );
            return;
          }
          await new Promise( (resolve) => setTimeout(resolve,5000));
          const signature = await announceWinners(
              {
                raffleId: raffle.id,
                winners: winnerAddresses.map((address) => new PublicKey(address)),
              }
            );
            if(!signature){
              console.error(`[CRON] Transaction of announce winner failed for raffle ${raffle.id}`);
              throw new Error("Transaction of announce winner failed");
            }
          
          // Update raffle with winners
          await tx.raffle.update({
            where: { id: raffle.id },
            data: {
              state: "SuccessEnded",
              winnerPicked: true,
              winners: {
                connect: winnerAddresses.map((address) => ({
                  walletAddress: address,
                })),
              },
            },
          });
          
          await tx.transaction.create({
            data: {
              raffleId: raffle.id,
              transactionId: signature,
              type: "RAFFLE_END",
              sender: raffle.createdBy,
              receiver: "system",
              amount: BigInt(0),
              isNft: false,
              mintAddress: "So11111111111111111111111111111111111111112",
            },
          });
          await tx.raffle.update({
            where: { id: raffle.id },
            data: {
              state: "SuccessEnded",
              winnerPicked: true,
            },
          });
          logger.log(
            `[CRON] Raffle ${raffle.id} ended successfully with ${winnerAddresses.length} winner(s): ${winnerAddresses.join(", ")}`
          );
        }, { timeout: 10000 });
      } catch (error) {
        logger.error(`[CRON] Error processing raffle ${raffle.id}:`, error);
      }
    }
  } catch (error) {
    logger.error("[CRON] Error fetching expired raffles:", error);
  }
}

export function startRaffleCronJob(): void {
  cron.schedule("* * * * *", async () => {
    logger.log("[CRON] Checking for expired raffles...");
    await processExpiredRaffles();
  });

  logger.log("[CRON] Raffle cron job started - checking every minute");
}

export default {
  startRaffleCronJob,
  processExpiredRaffles,
};

import cron from "node-cron";
import prismaClient from "../database/client";
import logger from "../utils/logger";


function selectRandomWinners(
  entries: { userAddress: string; quantity: number }[],
  numberOfWinners: number
): string[] {
  if (entries.length === 0) return [];

  // Create weighted pool - each entry appears 'quantity' times
  const weightedPool: string[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.quantity; i++) {
      weightedPool.push(entry.userAddress);
    }
  }

  // Get unique participants
  const uniqueParticipants = [...new Set(entries.map((e) => e.userAddress))];

  // If fewer unique participants than winners needed, all participants win
  if (uniqueParticipants.length <= numberOfWinners) {
    return uniqueParticipants;
  }

  // Fisher-Yates shuffle of the weighted pool
  for (let i = weightedPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedPool[i], weightedPool[j]] = [weightedPool[j], weightedPool[i]];
  }

  // Pick unique winners from shuffled pool
  const winners: Set<string> = new Set();
  let index = 0;

  while (winners.size < numberOfWinners && index < weightedPool.length) {
    winners.add(weightedPool[index]);
    index++;
  }

  // If we still need more winners (edge case), pick from remaining participants
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

/**
 * Process expired raffles - draw winners and end the raffle
 */
async function processExpiredRaffles(): Promise<void> {
  const now = new Date();

  try {
    // Find all active raffles that have expired
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

          if (winnerAddresses.length === 0) {
            // Edge case - couldn't select winners
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

          logger.log(
            `[CRON] Raffle ${raffle.id} ended successfully with ${winnerAddresses.length} winner(s): ${winnerAddresses.join(", ")}`
          );
        });
      } catch (error) {
        logger.error(`[CRON] Error processing raffle ${raffle.id}:`, error);
      }
    }
  } catch (error) {
    logger.error("[CRON] Error fetching expired raffles:", error);
  }
}

/**
 * Start the cron job to check for expired raffles every minute
 */
export function startRaffleCronJob(): void {
  // Run every minute: "* * * * *"
  cron.schedule("* * * * *", async () => {
    logger.log("[CRON] Checking for expired raffles...");
    await processExpiredRaffles();
  });

  logger.log("[CRON] Raffle cron job started - checking every minute");
}

/**
 * Manually trigger winner drawing for a specific raffle (for testing)
 */
export async function manuallyEndRaffle(raffleId: string): Promise<{
  success: boolean;
  message: string;
  winners?: string[];
}> {
  try {
    const raffle = await prismaClient.raffle.findUnique({
      where: { id: raffleId },
      include: { raffleEntries: true },
    });

    if (!raffle) {
      return { success: false, message: "Raffle not found" };
    }

    if (raffle.state !== "Active") {
      return { success: false, message: "Raffle is not active" };
    }

    if (raffle.winnerPicked) {
      return { success: false, message: "Winners have already been picked" };
    }

    if (raffle.raffleEntries.length === 0 || raffle.ticketSold === 0) {
      await prismaClient.raffle.update({
        where: { id: raffleId },
        data: {
          state: "FailedEnded",
          winnerPicked: true,
        },
      });
      return { success: true, message: "Raffle ended as failed (no entries)" };
    }

    const winnerAddresses = selectRandomWinners(
      raffle.raffleEntries,
      raffle.numberOfWinners
    );

    await prismaClient.raffle.update({
      where: { id: raffleId },
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

    return {
      success: true,
      message: "Raffle ended successfully",
      winners: winnerAddresses,
    };
  } catch (error) {
    logger.error(`[MANUAL] Error ending raffle ${raffleId}:`, error);
    return { success: false, message: "Error ending raffle" };
  }
}

export default {
  startRaffleCronJob,
  manuallyEndRaffle,
  processExpiredRaffles,
};

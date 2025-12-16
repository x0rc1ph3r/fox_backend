/*
  Warnings:

  - You are about to drop the column `winner` on the `raffles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `entries` DROP FOREIGN KEY `entries_raffleId_fkey`;

-- DropForeignKey
ALTER TABLE `entries` DROP FOREIGN KEY `entries_userAddress_fkey`;

-- DropIndex
DROP INDEX `raffles_winner_idx` ON `raffles`;

-- AlterTable
ALTER TABLE `raffles` DROP COLUMN `winner`,
    ADD COLUMN `numberOfWinners` INTEGER NOT NULL DEFAULT 1,
    MODIFY `floor` DOUBLE NULL;

-- CreateTable
CREATE TABLE `_RaffleWinner` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_RaffleWinner_AB_unique`(`A`, `B`),
    INDEX `_RaffleWinner_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_user_fkey` FOREIGN KEY (`userAddress`) REFERENCES `users`(`walletAddress`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_raffle_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RaffleWinner` ADD CONSTRAINT `_RaffleWinner_A_fkey` FOREIGN KEY (`A`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RaffleWinner` ADD CONSTRAINT `_RaffleWinner_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

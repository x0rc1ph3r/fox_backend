/*
  Warnings:

  - A unique constraint covering the columns `[gumballSpinId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `gumballId` INTEGER NULL,
    ADD COLUMN `gumballSpinId` INTEGER NULL,
    MODIFY `type` ENUM('RAFFLE_CREATION', 'RAFFLE_ENTRY', 'RAFFLE_WIN', 'RAFFLE_CANCEL', 'RAFFLE_END', 'RAFFLE_CLAIM', 'RAFFLE_REFUND', 'RAFFLE_PURCHASE', 'RAFFLE_DEPOSIT', 'AUCTION_CREATION', 'AUCTION_BID', 'AUCTION_CANCEL', 'AUCTION_END', 'AUCTION_CLAIM', 'AUCTION_REFUND', 'AUCTION_PURCHASE', 'AUCTION_DEPOSIT', 'GUMBALL_CREATION', 'GUMBALL_ACTIVATE', 'GUMBALL_PRIZE_ADD', 'GUMBALL_SPIN', 'GUMBALL_END', 'GUMBALL_CANCEL', 'GUMBALL_CLAIM_PRIZE', 'GUMBALL_UPDATE') NOT NULL;

-- CreateTable
CREATE TABLE `gumballs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorAddress` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `totalTickets` INTEGER NOT NULL,
    `ticketsSold` INTEGER NOT NULL DEFAULT 0,
    `prizesAdded` INTEGER NOT NULL DEFAULT 0,
    `ticketMint` VARCHAR(191) NULL,
    `ticketPrice` BIGINT NOT NULL,
    `isTicketSol` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('NONE', 'INITIALIZED', 'ACTIVE', 'CANCELLED', 'COMPLETED_SUCCESSFULLY', 'COMPLETED_FAILED') NOT NULL DEFAULT 'INITIALIZED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `activatedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,

    INDEX `gumballs_creatorAddress_idx`(`creatorAddress`),
    INDEX `gumballs_status_idx`(`status`),
    INDEX `gumballs_startTime_idx`(`startTime`),
    INDEX `gumballs_endTime_idx`(`endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gumball_prizes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gumballId` INTEGER NOT NULL,
    `prizeIndex` INTEGER NOT NULL,
    `isNft` BOOLEAN NOT NULL DEFAULT false,
    `mint` VARCHAR(191) NOT NULL,
    `totalAmount` BIGINT NOT NULL,
    `prizeAmount` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `quantityClaimed` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gumball_prizes_gumballId_idx`(`gumballId`),
    INDEX `gumball_prizes_mint_idx`(`mint`),
    UNIQUE INDEX `gumball_prizes_gumballId_prizeIndex_key`(`gumballId`, `prizeIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gumball_spins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gumballId` INTEGER NOT NULL,
    `prizeId` INTEGER NOT NULL,
    `spinnerAddress` VARCHAR(191) NOT NULL,
    `winnerAddress` VARCHAR(191) NULL,
    `prizeAmount` BIGINT NOT NULL,
    `spunAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `claimedAt` DATETIME(3) NULL,

    INDEX `gumball_spins_gumballId_idx`(`gumballId`),
    INDEX `gumball_spins_prizeId_idx`(`prizeId`),
    INDEX `gumball_spins_spinnerAddress_idx`(`spinnerAddress`),
    INDEX `gumball_spins_winnerAddress_idx`(`winnerAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `transactions_gumballSpinId_key` ON `transactions`(`gumballSpinId`);

-- CreateIndex
CREATE INDEX `transactions_gumballId_idx` ON `transactions`(`gumballId`);

-- CreateIndex
CREATE INDEX `transactions_gumballSpinId_idx` ON `transactions`(`gumballSpinId`);

-- AddForeignKey
ALTER TABLE `gumballs` ADD CONSTRAINT `gumballs_creatorAddress_fkey` FOREIGN KEY (`creatorAddress`) REFERENCES `users`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gumball_prizes` ADD CONSTRAINT `gumball_prizes_gumballId_fkey` FOREIGN KEY (`gumballId`) REFERENCES `gumballs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gumball_spins` ADD CONSTRAINT `gumball_spins_gumballId_fkey` FOREIGN KEY (`gumballId`) REFERENCES `gumballs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gumball_spins` ADD CONSTRAINT `gumball_spins_prizeId_fkey` FOREIGN KEY (`prizeId`) REFERENCES `gumball_prizes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gumball_spins` ADD CONSTRAINT `gumball_spins_spinnerAddress_fkey` FOREIGN KEY (`spinnerAddress`) REFERENCES `users`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gumball_spins` ADD CONSTRAINT `gumball_spins_winnerAddress_fkey` FOREIGN KEY (`winnerAddress`) REFERENCES `users`(`walletAddress`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_gumballId_fkey` FOREIGN KEY (`gumballId`) REFERENCES `gumballs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_gumballSpinId_fkey` FOREIGN KEY (`gumballSpinId`) REFERENCES `gumball_spins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

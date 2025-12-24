-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `auctionId` INTEGER NULL,
    MODIFY `type` ENUM('RAFFLE_CREATION', 'RAFFLE_ENTRY', 'RAFFLE_WIN', 'RAFFLE_CANCEL', 'RAFFLE_END', 'RAFFLE_CLAIM', 'RAFFLE_REFUND', 'RAFFLE_PURCHASE', 'RAFFLE_DEPOSIT', 'AUCTION_CREATION', 'AUCTION_BID', 'AUCTION_CANCEL', 'AUCTION_END', 'AUCTION_CLAIM', 'AUCTION_REFUND', 'AUCTION_PURCHASE', 'AUCTION_DEPOSIT') NOT NULL;

-- CreateTable
CREATE TABLE `auctions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdBy` VARCHAR(191) NOT NULL,
    `prizeMint` VARCHAR(191) NOT NULL,
    `prizeName` VARCHAR(191) NULL,
    `prizeImage` VARCHAR(191) NULL,
    `collectionName` VARCHAR(191) NULL,
    `collectionVerified` BOOLEAN NOT NULL DEFAULT false,
    `floorPrice` DOUBLE NULL,
    `traits` JSON NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `timeExtension` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `reservePrice` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'SOL',
    `bidIncrementPercent` DOUBLE NULL,
    `payRoyalties` BOOLEAN NOT NULL DEFAULT false,
    `royaltyPercentage` DOUBLE NULL DEFAULT 0,
    `highestBidAmount` VARCHAR(191) NOT NULL DEFAULT '0',
    `highestBidderWallet` VARCHAR(191) NULL,
    `hasAnyBid` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('NONE', 'INITIALIZED', 'ACTIVE', 'CANCELLED', 'COMPLETED_SUCCESSFULLY', 'COMPLETED_FAILED') NOT NULL DEFAULT 'NONE',
    `finalPrice` VARCHAR(191) NULL,
    `creatorAmount` VARCHAR(191) NULL,
    `feeAmount` VARCHAR(191) NULL,
    `completedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `auctionPda` VARCHAR(191) NULL,
    `auctionBump` INTEGER NULL,
    `bidEscrow` VARCHAR(191) NULL,

    INDEX `auctions_createdBy_idx`(`createdBy`),
    INDEX `auctions_status_idx`(`status`),
    INDEX `auctions_startsAt_idx`(`startsAt`),
    INDEX `auctions_endsAt_idx`(`endsAt`),
    INDEX `auctions_highestBidderWallet_idx`(`highestBidderWallet`),
    INDEX `auctions_collectionName_idx`(`collectionName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bids` (
    `id` VARCHAR(191) NOT NULL,
    `auctionId` INTEGER NOT NULL,
    `bidderWallet` VARCHAR(191) NOT NULL,
    `bidAmount` VARCHAR(191) NOT NULL,
    `bidTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `wasRefunded` BOOLEAN NOT NULL DEFAULT false,
    `refundedAt` DATETIME(3) NULL,
    `transactionId` VARCHAR(191) NULL,

    UNIQUE INDEX `bids_transactionId_key`(`transactionId`),
    INDEX `bids_auctionId_idx`(`auctionId`),
    INDEX `bids_bidderWallet_idx`(`bidderWallet`),
    INDEX `bids_bidTime_idx`(`bidTime`),
    INDEX `bids_wasRefunded_idx`(`wasRefunded`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FavouriteAuction` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FavouriteAuction_AB_unique`(`A`, `B`),
    INDEX `_FavouriteAuction_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `transactions_auctionId_idx` ON `transactions`(`auctionId`);

-- AddForeignKey
ALTER TABLE `auctions` ADD CONSTRAINT `auctions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auctions` ADD CONSTRAINT `auctions_highestBidderWallet_fkey` FOREIGN KEY (`highestBidderWallet`) REFERENCES `users`(`walletAddress`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_auctionId_fkey` FOREIGN KEY (`auctionId`) REFERENCES `auctions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_bidderWallet_fkey` FOREIGN KEY (`bidderWallet`) REFERENCES `users`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bids` ADD CONSTRAINT `bids_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`transactionId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_auctionId_fkey` FOREIGN KEY (`auctionId`) REFERENCES `auctions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FavouriteAuction` ADD CONSTRAINT `_FavouriteAuction_A_fkey` FOREIGN KEY (`A`) REFERENCES `auctions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FavouriteAuction` ADD CONSTRAINT `_FavouriteAuction_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

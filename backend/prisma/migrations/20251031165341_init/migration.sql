-- CreateTable
CREATE TABLE `entries` (
    `id` VARCHAR(191) NOT NULL,
    `userAddress` VARCHAR(191) NOT NULL,
    `raffleId` VARCHAR(191) NOT NULL,

    INDEX `entries_userAddress_idx`(`userAddress`),
    INDEX `entries_raffleId_idx`(`raffleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prize_data` (
    `id` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `mintAddress` VARCHAR(191) NOT NULL,
    `mint` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT true,
    `symbol` VARCHAR(191) NOT NULL,
    `decimals` INTEGER NULL,
    `image` VARCHAR(191) NOT NULL,
    `attributes` JSON NULL,
    `collection` VARCHAR(191) NULL,
    `creator` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `externalUrl` VARCHAR(191) NULL,
    `properties` JSON NULL,
    `floor` DOUBLE NULL,
    `raffleId` VARCHAR(191) NOT NULL,

    INDEX `prize_data_raffleId_idx`(`raffleId`),
    INDEX `prize_data_mint_idx`(`mint`),
    INDEX `prize_data_creator_idx`(`creator`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raffles` (
    `id` VARCHAR(191) NOT NULL,
    `raffle` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endsAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `ticketPrice` DOUBLE NOT NULL,
    `ticketSupply` INTEGER NOT NULL,
    `ticketSold` INTEGER NOT NULL DEFAULT 0,
    `claimed` BOOLEAN NOT NULL DEFAULT false,
    `winner` VARCHAR(191) NULL,
    `winnerPicked` BOOLEAN NOT NULL DEFAULT false,
    `floor` DOUBLE NOT NULL,
    `ttv` DOUBLE NOT NULL,
    `roi` DOUBLE NOT NULL,
    `entriesAddress` VARCHAR(191) NOT NULL,
    `prize` VARCHAR(191) NOT NULL,
    `maxEntries` INTEGER NOT NULL,
    `totalEntries` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `raffles_raffle_key`(`raffle`),
    INDEX `raffles_createdBy_idx`(`createdBy`),
    INDEX `raffles_raffle_idx`(`raffle`),
    INDEX `raffles_winner_idx`(`winner`),
    INDEX `raffles_endsAt_idx`(`endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `type` ENUM('DEPOSIT', 'CLAIM', 'PURCHASE', 'REFUND') NOT NULL,
    `sender` VARCHAR(191) NOT NULL,
    `receiver` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` BIGINT NOT NULL,
    `isNft` BOOLEAN NOT NULL DEFAULT false,
    `mintAddress` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `transactions_transactionId_key`(`transactionId`),
    INDEX `transactions_sender_idx`(`sender`),
    INDEX `transactions_receiver_idx`(`receiver`),
    INDEX `transactions_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_walletAddress_key`(`walletAddress`),
    INDEX `users_walletAddress_idx`(`walletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FavouriteRaffle` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_FavouriteRaffle_AB_unique`(`A`, `B`),
    INDEX `_FavouriteRaffle_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_userAddress_fkey` FOREIGN KEY (`userAddress`) REFERENCES `users`(`walletAddress`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_raffleId_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_data` ADD CONSTRAINT `prize_data_raffleId_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raffles` ADD CONSTRAINT `raffles_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`walletAddress`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_sender_fkey` FOREIGN KEY (`sender`) REFERENCES `users`(`walletAddress`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FavouriteRaffle` ADD CONSTRAINT `_FavouriteRaffle_A_fkey` FOREIGN KEY (`A`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FavouriteRaffle` ADD CONSTRAINT `_FavouriteRaffle_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to alter the column `A` on the `_FavouriteRaffle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `A` on the `_RaffleWinner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `entries` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `raffleId` on the `entries` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `prize_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `prize_data` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `raffleId` on the `prize_data` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `raffles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `raffles` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `_FavouriteRaffle` DROP FOREIGN KEY `_FavouriteRaffle_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RaffleWinner` DROP FOREIGN KEY `_RaffleWinner_A_fkey`;

-- DropForeignKey
ALTER TABLE `entries` DROP FOREIGN KEY `entries_raffle_fkey`;

-- DropForeignKey
ALTER TABLE `prize_data` DROP FOREIGN KEY `prize_data_raffleId_fkey`;

-- DropIndex
DROP INDEX `prize_data_raffleId_idx` ON `prize_data`;

-- AlterTable
ALTER TABLE `_FavouriteRaffle` MODIFY `A` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `_RaffleWinner` MODIFY `A` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `entries` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `raffleId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `prize_data` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `raffleId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `raffles` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `entries` ADD CONSTRAINT `entries_raffle_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_data` ADD CONSTRAINT `prize_data_raffleId_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FavouriteRaffle` ADD CONSTRAINT `_FavouriteRaffle_A_fkey` FOREIGN KEY (`A`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_RaffleWinner` ADD CONSTRAINT `_RaffleWinner_A_fkey` FOREIGN KEY (`A`) REFERENCES `raffles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `name` to the `gumballs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `gumball_prizes` DROP FOREIGN KEY `gumball_prizes_gumballId_fkey`;

-- AlterTable
ALTER TABLE `gumball_prizes` ADD COLUMN `decimals` INTEGER NULL,
    ADD COLUMN `floorPrice` BIGINT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `symbol` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `gumballs` ADD COLUMN `buyBackCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `buyBackEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `buyBackEscrow` VARCHAR(191) NULL,
    ADD COLUMN `buyBackPercentage` DOUBLE NULL,
    ADD COLUMN `buyBackProfit` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `manualStart` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxPrizes` INTEGER NOT NULL DEFAULT 1000,
    ADD COLUMN `maxProceeds` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `maxRoi` DOUBLE NULL,
    ADD COLUMN `minPrizes` INTEGER NOT NULL DEFAULT 2,
    ADD COLUMN `name` VARCHAR(32) NOT NULL,
    ADD COLUMN `rentAmount` BIGINT NULL,
    ADD COLUMN `totalPrizeValue` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `totalProceeds` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `uniqueBuyers` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('NONE', 'INITIALIZED', 'ACTIVE', 'CANCELLED', 'COMPLETED_SUCCESSFULLY', 'COMPLETED_FAILED') NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX `gumballs_name_idx` ON `gumballs`(`name`);

-- AddForeignKey
ALTER TABLE `gumball_prizes` ADD CONSTRAINT `gumball_prizes_gumballId_fkey` FOREIGN KEY (`gumballId`) REFERENCES `gumballs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

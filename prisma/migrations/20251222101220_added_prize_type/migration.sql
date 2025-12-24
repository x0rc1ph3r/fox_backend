-- AlterTable
ALTER TABLE `prize_data` ADD COLUMN `type` ENUM('TOKEN', 'NFT') NOT NULL DEFAULT 'TOKEN';

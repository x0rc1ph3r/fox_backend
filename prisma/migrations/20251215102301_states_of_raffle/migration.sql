-- AlterTable
ALTER TABLE `raffles` ADD COLUMN `state` ENUM('None', 'Initialized', 'Active', 'Cancelled', 'SuccessEnded', 'FailedEnded') NOT NULL DEFAULT 'None';

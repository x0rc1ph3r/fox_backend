-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `entryId` INTEGER NULL,
    ADD COLUMN `raffleId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `transactions_entryId_idx` ON `transactions`(`entryId`);

-- CreateIndex
CREATE INDEX `transactions_raffleId_idx` ON `transactions`(`raffleId`);

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_entryId_fkey` FOREIGN KEY (`entryId`) REFERENCES `entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_raffleId_fkey` FOREIGN KEY (`raffleId`) REFERENCES `raffles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropIndex
DROP INDEX `Order_uuid_key` ON `order`;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `updatedAt`,
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `order` DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `idMenu` INTEGER NULL,
    ADD COLUMN `idUser` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

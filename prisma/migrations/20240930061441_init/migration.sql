/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `menu` table. All the data in the column will be lost.
  - You are about to alter the column `category` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.
  - You are about to drop the column `createdAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `order` table. All the data in the column will be lost.
  - You are about to alter the column `payment_method` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(3))`.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(0))`.
  - You are about to drop the `orderlist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updateAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_orderId_fkey`;

-- DropIndex
DROP INDEX `Order_uuid_key` ON `order`;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `updatedAt`,
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `category` ENUM('FOOD', 'DRINK', 'SNACK') NOT NULL DEFAULT 'FOOD';

-- AlterTable
ALTER TABLE `order` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `idUser` INTEGER NULL,
    MODIFY `payment_method` ENUM('CASH', 'QRIS') NOT NULL DEFAULT 'CASH',
    MODIFY `status` ENUM('NEW', 'PAID', 'DONE') NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `updatedAt`,
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL,
    MODIFY `role` ENUM('MANAGER', 'CASHIER') NOT NULL DEFAULT 'CASHIER';

-- DropTable
DROP TABLE `orderlist`;

-- CreateTable
CREATE TABLE `order_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL DEFAULT '',
    `idOrder` INTEGER NULL,
    `idMenu` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `note` TEXT NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_list` ADD CONSTRAINT `order_list_idOrder_fkey` FOREIGN KEY (`idOrder`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_list` ADD CONSTRAINT `order_list_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `order` table. All the data in the column will be lost.
  - The primary key for the `orderlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `orderlist` table. All the data in the column will be lost.
  - Added the required column `idOrderList` to the `OrderList` table without a default value. This is not possible if the table is not empty.
  - Made the column `orderId` on table `orderlist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `menuId` on table `orderlist` required. This step will fail if there are existing NULL values in that column.

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
ALTER TABLE `order` DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `idMenu` INTEGER NULL,
    ADD COLUMN `idUser` INTEGER NULL,
    ADD COLUMN `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updateAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `orderlist` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `idOrderList` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `orderId` INTEGER NOT NULL,
    MODIFY `menuId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`idOrderList`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderList` ADD CONSTRAINT `OrderList_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderList` ADD CONSTRAINT `OrderList_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

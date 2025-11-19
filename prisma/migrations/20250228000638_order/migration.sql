/*
  Warnings:

  - You are about to drop the column `idMenu` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `idUser` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `order_date` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `order` table. All the data in the column will be lost.
  - The primary key for the `orderlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idOrderList` on the `orderlist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `OrderList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_idMenu_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_idUser_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_orderId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `idMenu`,
    DROP COLUMN `idUser`,
    DROP COLUMN `order_date`,
    DROP COLUMN `updateAt`,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `orderlist` DROP PRIMARY KEY,
    DROP COLUMN `idOrderList`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `orderId` INTEGER NULL,
    MODIFY `menuId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Order_uuid_key` ON `Order`(`uuid`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderList` ADD CONSTRAINT `OrderList_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderList` ADD CONSTRAINT `OrderList_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

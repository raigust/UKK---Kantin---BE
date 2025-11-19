/*
  Warnings:

  - You are about to drop the column `idUser` on the `order` table. All the data in the column will be lost.
  - Added the required column `iduser` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_idUser_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `idUser`,
    ADD COLUMN `iduser` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_iduser_fkey` FOREIGN KEY (`iduser`) REFERENCES `User`(`iduser`) ON DELETE CASCADE ON UPDATE CASCADE;

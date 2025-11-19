/*
  Warnings:

  - You are about to alter the column `category` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `category` ENUM('Food', 'Drink', 'Snack') NOT NULL DEFAULT 'Food';

/*
  Warnings:

  - You are about to alter the column `category` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.
  - You are about to alter the column `payment_method` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(3))`.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `menu` MODIFY `category` ENUM('FOOD', 'DRINK', 'SNACK') NOT NULL DEFAULT 'FOOD';

-- AlterTable
ALTER TABLE `order` MODIFY `payment_method` ENUM('CASH', 'QRIS') NOT NULL DEFAULT 'CASH',
    MODIFY `status` ENUM('NEW', 'PAID', 'DONE') NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('MANAGER', 'CASHIER') NOT NULL DEFAULT 'MANAGER';

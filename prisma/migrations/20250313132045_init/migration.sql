-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_idMenu_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_idUser_fkey`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_idMenu_fkey` FOREIGN KEY (`idMenu`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

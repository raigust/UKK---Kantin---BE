-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_iduser_fkey`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_iduser_fkey` FOREIGN KEY (`iduser`) REFERENCES `User`(`iduser`) ON DELETE SET NULL ON UPDATE CASCADE;

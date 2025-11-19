/*
  Warnings:

  - Added the required column `id_stan` to the `diskon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `diskon` ADD COLUMN `id_stan` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `transaksi` ALTER COLUMN `tanggal` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `diskon` ADD CONSTRAINT `diskon_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

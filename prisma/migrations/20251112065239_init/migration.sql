/*
  Warnings:

  - You are about to drop the column `category` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deskripsi` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foto` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_stan` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenis` to the `menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_makanan` to the `menu` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_iduser_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_orderId_fkey`;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `category`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `name`,
    DROP COLUMN `picture`,
    DROP COLUMN `price`,
    DROP COLUMN `updateAt`,
    DROP COLUMN `uuid`,
    ADD COLUMN `deskripsi` VARCHAR(191) NOT NULL,
    ADD COLUMN `foto` VARCHAR(191) NOT NULL,
    ADD COLUMN `harga` DOUBLE NOT NULL,
    ADD COLUMN `id_stan` INTEGER NOT NULL,
    ADD COLUMN `jenis` ENUM('makanan', 'minuman') NOT NULL,
    ADD COLUMN `nama_makanan` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `orderlist`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin_stan', 'siswa') NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_stan` VARCHAR(191) NOT NULL,
    `nama_pemilik` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `stan_id_user_key`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_siswa` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `telp` VARCHAR(191) NOT NULL,
    `id_user` INTEGER NOT NULL,
    `foto` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `siswa_id_user_key`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_menu` INTEGER NOT NULL,
    `id_diskon` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(191) NOT NULL,
    `persentase_diskon` DOUBLE NOT NULL,
    `tanggal_awal` DATETIME(3) NOT NULL,
    `tanggal_akhir` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL,
    `id_stan` INTEGER NOT NULL,
    `id_siswa` INTEGER NOT NULL,
    `status` ENUM('belum_dikonfirm', 'dimasak', 'diantar', 'sampai') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_menu` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `harga_beli` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stan` ADD CONSTRAINT `stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

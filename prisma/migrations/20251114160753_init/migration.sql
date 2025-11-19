-- AlterTable
ALTER TABLE `menu` MODIFY `deskripsi` VARCHAR(191) NULL,
    MODIFY `foto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `siswa` MODIFY `foto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaksi` ALTER COLUMN `tanggal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `role` DROP DEFAULT;

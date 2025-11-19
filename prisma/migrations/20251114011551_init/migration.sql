/*
  Warnings:

  - Added the required column `foto` to the `siswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `foto` TEXT NOT NULL;

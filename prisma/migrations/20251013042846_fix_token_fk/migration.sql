/*
  Warnings:

  - The primary key for the `departamento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `personal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `proyecto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `proyectopersonal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[uuid]` on the table `departamento` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `personal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `proyecto` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `proyectopersonal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `departamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `personal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `proyecto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `proyectopersonal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `token` DROP FOREIGN KEY `Token_usuarioId_fkey`;

-- AlterTable
ALTER TABLE `departamento` DROP PRIMARY KEY,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `uuid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `personal` DROP PRIMARY KEY,
    ADD COLUMN `JefeId` BIGINT NULL,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `uuid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `proyecto` DROP PRIMARY KEY,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `uuid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `proyectopersonal` DROP PRIMARY KEY,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `uuid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `token` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `usuario` DROP PRIMARY KEY,
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `uuid` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `departamento_uuid_key` ON `departamento`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `personal_uuid_key` ON `personal`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `proyecto_uuid_key` ON `proyecto`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `proyectopersonal_uuid_key` ON `proyectopersonal`(`uuid`);

-- CreateIndex
CREATE UNIQUE INDEX `usuario_uuid_key` ON `usuario`(`uuid`);

-- AddForeignKey
ALTER TABLE `personal` ADD CONSTRAINT `personal_JefeId_fkey` FOREIGN KEY (`JefeId`) REFERENCES `personal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `token_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

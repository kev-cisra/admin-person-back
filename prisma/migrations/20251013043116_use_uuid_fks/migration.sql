-- AlterTable
ALTER TABLE `personal` MODIFY `usuarioId` VARCHAR(191) NULL,
    MODIFY `departamentoId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `token` ALTER COLUMN `updatedAt` DROP DEFAULT;

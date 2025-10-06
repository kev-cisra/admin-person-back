-- CreateTable
CREATE TABLE `token` (
    `uuid` BIGINT NOT NULL AUTO_INCREMENT,
    `secretHash` VARCHAR(255) NOT NULL,
    `type` ENUM('api', 'refresh', 'reset_password', 'verify_email', 'magic_login', 'session', 'oauth_access') NOT NULL DEFAULT 'session',
    `revokedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `deviceId` VARCHAR(255) NULL,
    `usuarioId` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `Token_usuarioId_fkey`(`usuarioId`),
    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `Token_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

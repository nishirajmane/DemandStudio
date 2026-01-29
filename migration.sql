-- ==========================================
-- 1. Create Core Multi-tenant Tables
-- ==========================================

-- Organization: The root tenant.
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- OrganizationMember: Many-to-Many link between User and Organization.
-- Roles: OWNER (Full control), ADMIN (Manage content/projects), MEMBER (View/Edit assigned).
CREATE TABLE `OrganizationMember` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'MEMBER', 
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrganizationMember_organizationId_idx`(`organizationId`),
    INDEX `OrganizationMember_userId_idx`(`userId`),
    UNIQUE INDEX `OrganizationMember_organizationId_userId_key`(`organizationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Project: distinct websites/apps under an Organization.
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    INDEX `Project_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- 2. Add Constraints & Foreign Keys
-- ==========================================

ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `OrganizationMember` ADD CONSTRAINT `OrganizationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Project` ADD CONSTRAINT `Project_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================
-- 3. Update Existing Tables for Multi-tenancy
-- ==========================================

-- Add organizationId to Blog
ALTER TABLE `Blog` ADD COLUMN `organizationId` VARCHAR(191) NULL;
CREATE INDEX `Blog_organizationId_idx` ON `Blog`(`organizationId`);
ALTER TABLE `Blog` ADD CONSTRAINT `Blog_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add organizationId to Post
ALTER TABLE `Post` ADD COLUMN `organizationId` VARCHAR(191) NULL;
CREATE INDEX `Post_organizationId_idx` ON `Post`(`organizationId`);
ALTER TABLE `Post` ADD CONSTRAINT `Post_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add organizationId to Tag
ALTER TABLE `Tag` ADD COLUMN `organizationId` VARCHAR(191) NULL;
CREATE INDEX `Tag_organizationId_idx` ON `Tag`(`organizationId`);
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add organizationId to CaseStudy
ALTER TABLE `CaseStudy` ADD COLUMN `organizationId` VARCHAR(191) NULL;
CREATE INDEX `CaseStudy_organizationId_idx` ON `CaseStudy`(`organizationId`);
ALTER TABLE `CaseStudy` ADD CONSTRAINT `CaseStudy_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add projectId to ContentType (The new generic system)
ALTER TABLE `ContentType` ADD COLUMN `projectId` VARCHAR(191) NULL;
CREATE INDEX `ContentType_projectId_idx` ON `ContentType`(`projectId`);
ALTER TABLE `ContentType` ADD CONSTRAINT `ContentType_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Note on User Roles:
-- The 'User' table already has a 'role' column. 
-- We will use two sets of values for it:
-- 'SUPERADMIN' -> Platform owner, can manage Organizations.
-- 'USER' -> Regular user, permissions depend on OrganizationMember.role.
-- Existing 'admin' users should be treated as System Admins or migrated.


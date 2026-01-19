-- AlterTable
ALTER TABLE "PropertyEnergy" ADD COLUMN "descriptiveSheetGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "descriptiveSheetGeneratedAt" TIMESTAMP(3),
ADD COLUMN "descriptiveSheetPdfUrl" TEXT;


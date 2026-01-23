/*
  Warnings:

  - You are about to drop the column `descriptiveSheetPdfUrl` on the `PropertyEnergy` table. All the data in the column will be lost.
  - You are about to drop the column `dpeImageUrl` on the `PropertyEnergy` table. All the data in the column will be lost.
  - You are about to drop the column `gesImageUrl` on the `PropertyEnergy` table. All the data in the column will be lost.
  - You are about to drop the column `labelPdfUrl` on the `PropertyEnergy` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PropertyDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvaluationSituation" AS ENUM ('ACHAT', 'VENTE', 'RENSEIGNEMENT');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('NOUVELLE', 'EN_COURS', 'TRAITEE', 'ARCHIVEE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'DPE_IMAGE';
ALTER TYPE "DocumentType" ADD VALUE 'GES_IMAGE';
ALTER TYPE "DocumentType" ADD VALUE 'LABEL_PDF';
ALTER TYPE "DocumentType" ADD VALUE 'DESCRIPTIVE_SHEET_PDF';

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PropertyDocument" ADD COLUMN     "description" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PropertyEnergy" DROP COLUMN "descriptiveSheetPdfUrl",
DROP COLUMN "dpeImageUrl",
DROP COLUMN "gesImageUrl",
DROP COLUMN "labelPdfUrl";

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "address" TEXT,
    "surface" TEXT,
    "levels" TEXT,
    "rooms" TEXT,
    "bedrooms" TEXT,
    "bathrooms" TEXT,
    "constructionYear" TEXT,
    "renovations" TEXT,
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "situation" "EvaluationSituation" NOT NULL DEFAULT 'RENSEIGNEMENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'NOUVELLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_status_idx" ON "Evaluation"("status");

-- CreateIndex
CREATE INDEX "Evaluation_createdAt_idx" ON "Evaluation"("createdAt");

-- CreateIndex
CREATE INDEX "Evaluation_email_idx" ON "Evaluation"("email");

-- CreateIndex
CREATE INDEX "Evaluation_postalCode_idx" ON "Evaluation"("postalCode");

-- CreateIndex
CREATE INDEX "PropertyDocument_type_idx" ON "PropertyDocument"("type");

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_type_idx" ON "PropertyDocument"("propertyId", "type");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

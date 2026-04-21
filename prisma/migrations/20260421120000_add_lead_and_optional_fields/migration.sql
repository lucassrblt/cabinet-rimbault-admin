-- CreateEnum
CREATE TYPE "HonorairesCharge" AS ENUM ('ACQUEREUR', 'VENDEUR', 'PARTAGE');

-- CreateEnum
CREATE TYPE "LeadSubject" AS ENUM ('BIEN_SALE', 'BIEN_RENT', 'ESTIMATION', 'APPOINTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadProfile" AS ENUM ('BUYER', 'INVESTOR', 'CURIOUS', 'TENANT');

-- CreateEnum
CREATE TYPE "LeadFinancing" AS ENUM ('APPROVED', 'IN_PROGRESS', 'TO_STUDY', 'CASH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE');

-- AlterTable
ALTER TABLE "PropertyFinance" ADD COLUMN "honorairesCharge" "HonorairesCharge";

-- AlterTable
ALTER TABLE "PropertyEnergy" ADD COLUMN "dateReferenceEnergie" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN "condition" "PropertyCondition";
ALTER TABLE "Evaluation" ADD COLUMN "timeframe" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "intent" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "message" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "rgpd" BOOLEAN;
ALTER TABLE "Evaluation" ADD COLUMN "source" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "referer" TEXT;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "subject" "LeadSubject" NOT NULL,
    "propertyReference" TEXT,
    "profile" "LeadProfile",
    "financing" "LeadFinancing",
    "visitAvailability" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "rgpd" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "page" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NOUVEAU',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_subject_idx" ON "Lead"("subject");

-- CreateIndex
CREATE INDEX "Lead_propertyReference_idx" ON "Lead"("propertyReference");

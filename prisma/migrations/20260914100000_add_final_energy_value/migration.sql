-- AlterTable
-- Consommation en énergie finale (kWh/m².an), affichée sur l'étiquette DPE à
-- côté de l'énergie primaire. Nullable : les biens saisis avant cette colonne
-- n'ont pas la donnée, l'étiquette omet alors la ligne.
ALTER TABLE "PropertyEnergy" ADD COLUMN "finalEnergyValue" INTEGER;

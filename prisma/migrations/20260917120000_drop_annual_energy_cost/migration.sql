-- AlterTable
-- Suppression du montant annuel unique, hérité du DPE d'avant juillet 2021.
-- Le DPE fournit désormais une fourchette : annualEnergyCostMin et
-- annualEnergyCostMax la portent. Aucun code applicatif ne lisait ni n'écrivait
-- cette colonne, seuls le seed et les fixtures de test la renseignaient.
ALTER TABLE "PropertyEnergy" DROP COLUMN "annualEnergyCost";

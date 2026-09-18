/**
 * Mention légale des dépenses annuelles d'énergie.
 *
 * Obligatoire dans toute annonce immobilière depuis le 1er janvier 2022
 * (CCH, art. R126-23) : la formule est imposée, l'année de référence des prix
 * doit être indiquée, et les caractères doivent être au moins de la taille du
 * reste de l'annonce. Les montants proviennent du DPE, abonnements compris.
 *
 * Partagé par l'affiche vitrine et la fiche descriptive, qui doivent porter
 * exactement la même phrase.
 */

/** Montants en euros par an, tels que relevés sur le DPE. */
export interface EnergyCostNoticeInput {
  annualEnergyCostMin?: number | null;
  annualEnergyCostMax?: number | null;
  /** Date d'indexation des prix, ou à défaut date du diagnostic. */
  referenceDate?: string | Date | null;
}

/** Montant à la française : « 1 090 ». */
export function formatEnergyAmount(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

/**
 * Date en toutes lettres, avec le cas particulier du premier jour du mois :
 * la formule consacrée écrit « 1er janvier », pas « 1 janvier ».
 * Renvoie null si la date est inexploitable.
 */
export function formatEnergyReferenceDate(
  value: string | Date,
): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return date.getDate() === 1 ? formatted.replace(/^1 /, "1er ") : formatted;
}

/**
 * Compose la mention complète, ou renvoie null quand elle n'a pas lieu d'être.
 *
 * La fourchette exige ses deux bornes : un montant seul serait présenté comme
 * une valeur unique, ce que la formule ne permet pas. La phrase sur les prix
 * de référence est omise si aucune date exploitable n'est disponible.
 */
export function buildEnergyCostNotice({
  annualEnergyCostMin,
  annualEnergyCostMax,
  referenceDate,
}: EnergyCostNoticeInput): string | null {
  if (annualEnergyCostMin == null || annualEnergyCostMax == null) {
    return null;
  }

  const base =
    "Montant estimé des dépenses annuelles d'énergie pour un usage standard : " +
    `entre ${formatEnergyAmount(annualEnergyCostMin)} € et ` +
    `${formatEnergyAmount(annualEnergyCostMax)} € par an.`;

  const formattedDate = referenceDate
    ? formatEnergyReferenceDate(referenceDate)
    : null;

  if (!formattedDate) return base;

  return `${base} Prix moyens des énergies indexés au ${formattedDate} (abonnements compris).`;
}

/**
 * Accroche de la description sur l'affiche vitrine.
 *
 * Les descriptions commencent souvent par le titre du bien (« MAISON 5 PIECES
 * + JARDIN – Entre les stations… »). Ce début est alors mis en avant ; sinon
 * la description est rendue telle quelle.
 */
export interface LeadIn {
  /** Début de la description identique au titre, ou chaîne vide. */
  lead: string;
  /** Suite de la description. */
  rest: string;
}

export function splitLeadIn(description: string, title: string): LeadIn {
  const text = description.trimStart();
  const prefix = title.trim();

  if (!prefix || !text.toLocaleLowerCase("fr").startsWith(prefix.toLocaleLowerCase("fr"))) {
    return { lead: "", rest: description };
  }

  return { lead: text.slice(0, prefix.length), rest: text.slice(prefix.length) };
}

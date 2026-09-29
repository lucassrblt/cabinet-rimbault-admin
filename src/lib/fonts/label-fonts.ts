/**
 * Polices de l'affiche vitrine.
 *
 * Chargées par next/font : téléchargées au build et servies par l'admin, donc
 * aucune dépendance réseau au moment de générer le PDF. html2canvas clone le
 * document avec ses @font-face, la police se retrouve telle quelle dans
 * l'image.
 */
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";

/** Titres, ville, prix et bandeau : condensée grasse, lisible de loin. */
export const labelDisplayFont = Barlow_Condensed({
  weight: ["700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "block",
});

/** Texte courant : étroite, elle fait tenir une longue description. */
export const labelTextFont = Source_Sans_3({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "block",
});

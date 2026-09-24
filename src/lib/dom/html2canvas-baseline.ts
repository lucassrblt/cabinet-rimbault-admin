/**
 * Corrige la ligne de base du texte dessiné par html2canvas sous Tailwind.
 *
 * Pour placer le texte, html2canvas mesure la ligne de base de chaque police
 * avec une image de 1 px posée sur la ligne d'un texte d'essai, dans le
 * document réel (et non dans son clone, d'où l'inefficacité d'`onclone`). Le
 * preflight de Tailwind met toutes les images en `display: block` : l'image
 * passe à la ligne, la ligne de base mesurée tombe une ligne trop bas, et
 * tout le texte est dessiné trop bas, d'autant plus que la police est grande
 * (titre qui passe sous un trait, prix recouvert, bandeau coupé).
 *
 * On remet cette seule image en ligne le temps de la capture.
 */

/** Image d'essai de html2canvas 1.4 (`SMALL_IMAGE`). */
const HTML2CANVAS_PROBE_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export async function withHtml2canvasBaselineFix<T>(
  capture: () => Promise<T>,
): Promise<T> {
  const style = document.createElement("style");
  style.textContent = `img[src="${HTML2CANVAS_PROBE_IMAGE}"] { display: inline !important; }`;
  document.head.appendChild(style);
  try {
    return await capture();
  } finally {
    style.remove();
  }
}

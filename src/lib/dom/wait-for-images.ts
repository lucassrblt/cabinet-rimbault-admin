/**
 * Attend que les images d'un conteneur soient réellement chargées.
 *
 * html2canvas photographie le DOM tel qu'il est : une image encore en vol
 * ressort en case blanche dans le PDF. On attendait jusqu'ici un délai fixe
 * (800 ms), pari d'autant plus fragile depuis que les étiquettes DPE/GES sont
 * des SVG servis par Supabase en cross-origin.
 */

/** Laisse le navigateur peindre la frame courante (deux rAF successifs). */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/**
 * Résout quand toutes les `<img>` du conteneur sont chargées (ou en échec, ce
 * qui ne doit pas bloquer la génération), puis après un cycle de peinture.
 *
 * @param container - Élément dont on attend les images
 * @param timeoutMs - Garde-fou : au-delà, on rend la main quoi qu'il arrive
 */
export async function waitForImages(
  container: HTMLElement | null,
  timeoutMs = 10_000,
): Promise<void> {
  if (!container) return

  // Laisser React committer le rendu en cours avant d'inventorier les images :
  // sinon on inspecterait les précédentes, déjà chargées, et on rendrait la
  // main aussitôt.
  await nextPaint()

  const images = Array.from(container.querySelectorAll("img"))

  const settled = images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()

    return new Promise<void>((resolve) => {
      // On ne rejette jamais : une image manquante ne doit pas empêcher la
      // génération, elle laissera simplement un blanc.
      const done = () => resolve()
      img.addEventListener("load", done, { once: true })
      img.addEventListener("error", done, { once: true })
    })
  })

  const timeout = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs)
  })

  await Promise.race([Promise.all(settled), timeout])

  // `decode()` garantit que l'image est décodée, pas seulement téléchargée.
  await Promise.all(
    images.map((img) => img.decode?.().catch(() => undefined) ?? undefined),
  )

  await nextPaint()
}

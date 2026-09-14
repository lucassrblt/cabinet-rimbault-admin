import { describe, expect, it } from "vitest"

import { generateDpeSvg } from "@/lib/energy-labels/generate-dpe"
import { generateGesSvg } from "@/lib/energy-labels/generate-ges"
import {
  BAR_X,
  CALLOUT_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ROWS_BOTTOM,
  ROWS_TOP,
  barWidth,
  rowY,
} from "@/lib/energy-labels/label-layout"
import {
  DPE_COLORS,
  DPE_THRESHOLDS,
  ENERGY_CLASSES,
  GES_COLORS,
  GES_THRESHOLDS,
  getDpeClassFromValue,
  getGesClassFromValue,
  isPassoireEnergetique,
  isValidEnergyClass,
  type EnergyClass,
} from "@/lib/energy-labels/scale"
import {
  fitFontSize,
  formatNumber,
  textWidthPx,
  wrapText,
} from "@/lib/energy-labels/svg-text"

/** Parse le SVG et échoue si le document n'est pas bien formé. */
function parseSvg(svg: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  const error = doc.querySelector("parsererror")
  expect(error, `SVG mal formé : ${error?.textContent}`).toBeNull()
  const root = doc.documentElement as unknown as SVGSVGElement
  expect(root.nodeName).toBe("svg")
  return root
}

/** Ligne de rappel reliant la barre retenue à l'encadré. */
function leaderLine(svg: string): { x1: number; x2: number; y: number } {
  const match = svg.match(
    /<line class="leader" x1="([\d.]+)" x2="([\d.]+)" y1="([\d.]+)" y2="([\d.]+)"/,
  )
  expect(match, "ligne de rappel absente").not.toBeNull()
  expect(match?.[3]).toBe(match?.[4]) // strictement horizontale
  return { x1: Number(match?.[1]), x2: Number(match?.[2]), y: Number(match?.[3]) }
}

/** Cadre de l'encadré de valeurs. */
function calloutBox(svg: string): { top: number; height: number } {
  const match = svg.match(
    new RegExp(`<rect x="${CALLOUT_X}" y="([\\d.]+)" width="\\d+" height="([\\d.]+)" rx="12"`),
  )
  expect(match, "encadré absent").not.toBeNull()
  return { top: Number(match?.[1]), height: Number(match?.[2]) }
}

describe("scale — source de vérité de l'échelle", () => {
  it("expose les 7 classes dans l'ordre réglementaire", () => {
    expect(ENERGY_CLASSES).toEqual(["A", "B", "C", "D", "E", "F", "G"])
  })

  it("valide les classes A–G et rejette le reste", () => {
    for (const c of ENERGY_CLASSES) {
      expect(isValidEnergyClass(c)).toBe(true)
      expect(isValidEnergyClass(c.toLowerCase())).toBe(true)
    }
    expect(isValidEnergyClass("Z")).toBe(false)
    expect(isValidEnergyClass("VIERGE")).toBe(false)
  })

  it("ne considère comme passoire énergétique que F et G", () => {
    expect(isPassoireEnergetique("F")).toBe(true)
    expect(isPassoireEnergetique("G")).toBe(true)
    // E n'est PAS une passoire énergétique — c'était le faux sens historique.
    expect(isPassoireEnergetique("E")).toBe(false)
    for (const c of ["A", "B", "C", "D", "VIERGE"]) {
      expect(isPassoireEnergetique(c)).toBe(false)
    }
    expect(isPassoireEnergetique(null)).toBe(false)
    expect(isPassoireEnergetique(undefined)).toBe(false)
  })

  it("classe une consommation selon les seuils DPE 2021", () => {
    expect(getDpeClassFromValue(0)).toBe("A")
    expect(getDpeClassFromValue(70)).toBe("A")
    expect(getDpeClassFromValue(71)).toBe("B")
    expect(getDpeClassFromValue(110)).toBe("B")
    expect(getDpeClassFromValue(180)).toBe("C")
    expect(getDpeClassFromValue(250)).toBe("D")
    expect(getDpeClassFromValue(330)).toBe("E")
    expect(getDpeClassFromValue(420)).toBe("F")
    expect(getDpeClassFromValue(421)).toBe("G")
    expect(getDpeClassFromValue(9999)).toBe("G")
  })

  it("classe des émissions selon les seuils GES 2021", () => {
    expect(getGesClassFromValue(0)).toBe("A")
    expect(getGesClassFromValue(6)).toBe("A")
    expect(getGesClassFromValue(7)).toBe("B")
    expect(getGesClassFromValue(11)).toBe("B")
    expect(getGesClassFromValue(30)).toBe("C")
    expect(getGesClassFromValue(50)).toBe("D")
    expect(getGesClassFromValue(70)).toBe("E")
    expect(getGesClassFromValue(100)).toBe("F")
    expect(getGesClassFromValue(101)).toBe("G")
  })

  it("reste cohérent entre seuils et fonction de classement", () => {
    for (const c of ENERGY_CLASSES) {
      if (c === "G") continue
      expect(getDpeClassFromValue(DPE_THRESHOLDS[c])).toBe(c)
      expect(getGesClassFromValue(GES_THRESHOLDS[c])).toBe(c)
    }
  })

  it("garde deux palettes distinctes : DPE vert→rouge, GES bleu→violet", () => {
    for (const c of ENERGY_CLASSES) {
      expect(DPE_COLORS[c]).not.toBe(GES_COLORS[c])
    }
    // Teintes relevées sur la maquette de référence.
    expect(GES_COLORS.A).toBe("#91d9fa")
    expect(DPE_COLORS.A).toBe("#088748")
  })
})

describe("svg-text", () => {
  it("garde la taille nominale quand le texte tient", () => {
    expect(fitFontSize("150 kWh/m².an", 200, 14, 9)).toBe(14)
  })

  it("rétrécit quand le texte déborde, sans descendre sous le plancher", () => {
    const fitted = fitFontSize("1 250 kWh/m².an", 100, 14, 9)
    expect(fitted).toBeLessThan(14)
    expect(textWidthPx("1 250 kWh/m².an", fitted)).toBeLessThanOrEqual(100)
    expect(fitFontSize("123456789", 5, 14, 9)).toBe(9)
  })

  it("découpe un libellé en lignes qui tiennent dans la largeur", () => {
    const lines = wrapText("Consommation (énergie primaire)", 120, 13)
    expect(lines.length).toBeGreaterThan(1)
    for (const line of lines) {
      expect(textWidthPx(line, 13, "regular")).toBeLessThanOrEqual(120)
    }
    expect(lines.join(" ")).toBe("Consommation (énergie primaire)")
  })

  it("groupe les milliers avec une espace fine insécable", () => {
    expect(formatNumber(87)).toBe("87")
    expect(formatNumber(1250)).toBe("1 250")
    expect(formatNumber(1250)).not.toContain(" ")
  })
})

describe("generateDpeSvg", () => {
  const gesValue = 35

  it.each(ENERGY_CLASSES)("produit un SVG bien formé pour la classe %s", (c) => {
    const svg = generateDpeSvg(180, c, gesValue)
    const root = parseSvg(svg)

    expect(root.getAttribute("viewBox")).toBe(
      `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    )
    expect(root.getAttribute("role")).toBe("img")
    expect(root.querySelector("title")?.textContent).toContain(`classe ${c}`)
  })

  it("emploie le vocabulaire officiel du nouveau modèle", () => {
    const svg = generateDpeSvg(166, "C", 6, 87)
    expect(svg).toContain("Diagnostic de performance énergétique (DPE)")
    expect(svg).toContain("Logement économe")
    expect(svg).toContain("Logement énergivore")
  })

  it.each(ENERGY_CLASSES)(
    "ne porte la mention passoire que sur F et G, classe %s retenue",
    (c) => {
      const svg = generateDpeSvg(180, c, gesValue)
      const notes = [...svg.matchAll(/class="bar-note"[^>]*>([^<]+)</g)].map(
        (m) => m[1],
      )
      expect(notes).toEqual(["Passoire énergétique", "Passoire énergétique"])

      // Les mentions sont bien portées par les barres F et G, et tiennent
      // dans le corps de la barre sans déborder sur la pointe.
      for (const letter of ["F", "G"] as EnergyClass[]) {
        const match = svg.match(
          new RegExp(
            `class="bar-note" font-size="([\\d.]+)px" x="(\\d+)" y="([\\d.]+)"`,
          ),
        )
        expect(match, `mention absente pour ${letter}`).not.toBeNull()
        const size = Number(match?.[1])
        expect(
          textWidthPx("Passoire énergétique", size),
        ).toBeLessThanOrEqual(barWidth(letter) - 30)
      }
      for (const letter of ["F", "G"] as EnergyClass[]) {
        const { center } = rowY(letter)
        const baselines = [
          ...svg.matchAll(/class="bar-note"[^>]*y="([\d.]+)"/g),
        ].map((m) => Number(m[1]))
        // Centrée verticalement dans sa barre, à la moitié d'une capitale près.
        expect(
          baselines.some((b) => Math.abs(b - center) < 12),
        ).toBe(true)
      }
    },
  )

  it("n'affiche l'énergie finale que si elle est renseignée", () => {
    const withFinal = generateDpeSvg(166, "C", 6, 87)
    expect(withFinal).toContain("Énergie finale")
    expect(withFinal).toContain("87 kWh/m².an")

    const withoutFinal = generateDpeSvg(166, "C", 6)
    expect(withoutFinal).not.toContain("Énergie finale")
    // L'encadré se resserre quand la ligne disparaît.
    expect(calloutBox(withoutFinal).height).toBeLessThan(
      calloutBox(withFinal).height,
    )
  })

  it("porte la consommation, l'énergie primaire et les émissions", () => {
    const svg = generateDpeSvg(166, "C", 6, 87)
    expect(svg).toContain("Consommation")
    expect(svg).toContain("166 kWh/m².an")
    expect(svg).toContain("Émissions")
    expect(svg).toContain("6 kg CO₂/m².an")
  })

  it.each(ENERGY_CLASSES)(
    "relie la pointe de la flèche %s à l'encadré, sans viser un coin",
    (c) => {
      const svg = generateDpeSvg(180, c, 35)
      const line = leaderLine(svg)
      const box = calloutBox(svg)

      // Part de la pointe de la flèche retenue, arrive au bord de l'encadré.
      expect(line.x1).toBe(BAR_X + barWidth(c))
      expect(line.x2).toBe(CALLOUT_X)
      expect(line.y).toBe(rowY(c).center)

      // Et touche le bord droit, pas l'arrondi des coins.
      expect(line.y).toBeGreaterThanOrEqual(box.top + 14)
      expect(line.y).toBeLessThanOrEqual(box.top + box.height - 14)
    },
  )

  it.each(ENERGY_CLASSES)(
    "aligne l'encadré sur la rangée retenue sans sortir de la pile, classe %s",
    (c) => {
      const box = calloutBox(generateDpeSvg(180, c, 35, 90))
      const { top } = rowY(c)
      // Aligné sur le haut de la rangée, remonté juste ce qu'il faut pour ne
      // pas descendre sous la pile : la règle des maquettes.
      expect(box.top).toBeLessThanOrEqual(top)
      expect(box.top + box.height).toBeLessThanOrEqual(ROWS_BOTTOM + 20)
      expect(box.top).toBeGreaterThanOrEqual(ROWS_TOP)
    },
  )

  it("reproduit les mesures de la maquette pour la classe C", () => {
    // DPE C — 166 kWh/m².an, énergie finale 87, 6 kg CO₂/m².an.
    const svg = generateDpeSvg(166, "C", 6, 87)
    const box = calloutBox(svg)
    expect(box.height).toBe(391)
    // Trop haut pour tenir sous la rangée C : remonté d'autant qu'il faut.
    expect(box.top).toBe(ROWS_BOTTOM + 20 - 391)
    expect(leaderLine(svg).y).toBe(rowY("C").center)
  })

  it("rétrécit une consommation à 4 chiffres pour qu'elle tienne dans l'encadré", () => {
    const svg = generateDpeSvg(1250, "G", 1450)
    const match = svg.match(
      /class="callout-value" font-size="([\d.]+)px"[^>]*>1 250 kWh/,
    )
    expect(match).not.toBeNull()
    const fontSize = Number(match?.[1])
    expect(textWidthPx("1 250 kWh/m².an", fontSize)).toBeLessThanOrEqual(
      208,
    )
  })

  it("tire ses couleurs de la palette DPE partagée", () => {
    const svg = generateDpeSvg(180, "D", 35)
    for (const c of ENERGY_CLASSES) {
      expect(svg).toContain(DPE_COLORS[c])
    }
  })
})

describe("generateGesSvg", () => {
  it.each(ENERGY_CLASSES)("produit un SVG bien formé pour la classe %s", (c) => {
    const svg = generateGesSvg(35, c)
    const root = parseSvg(svg)

    expect(root.getAttribute("viewBox")).toBe(
      `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    )
    expect(root.getAttribute("role")).toBe("img")
    expect(root.querySelector("title")?.textContent).toContain(`classe ${c}`)
  })

  it("emploie le vocabulaire officiel du nouveau modèle", () => {
    const svg = generateGesSvg(6, "B")
    expect(svg).toContain("Indice d'émission de gaz à effet de serre (GES)")
    expect(svg).toContain("Faible émission de GES")
    expect(svg).toContain("Forte émission de GES")
    expect(svg).toContain("6 kg CO₂/m².an")
  })

  it("ne porte aucune mention de passoire énergétique, réservée au DPE", () => {
    for (const c of ENERGY_CLASSES) {
      expect(generateGesSvg(35, c)).not.toContain("Passoire")
    }
  })

  it("tire ses couleurs de la palette GES partagée, pas de la palette DPE", () => {
    const svg = generateGesSvg(35, "D")
    for (const c of ENERGY_CLASSES) {
      expect(svg).toContain(GES_COLORS[c])
    }
    // Aucune teinte DPE (vert/rouge) ne doit apparaître sur une étiquette GES.
    for (const c of ENERGY_CLASSES) {
      expect(svg).not.toContain(DPE_COLORS[c])
    }
  })

  it.each(ENERGY_CLASSES)(
    "relie le bout de la barre %s à l'encadré",
    (c) => {
      const svg = generateGesSvg(35, c)
      const line = leaderLine(svg)
      const box = calloutBox(svg)

      expect(line.x1).toBe(BAR_X + barWidth(c))
      expect(line.x2).toBe(CALLOUT_X)
      expect(line.y).toBe(rowY(c).center)
      expect(line.y).toBeGreaterThanOrEqual(box.top + 14)
      expect(line.y).toBeLessThanOrEqual(box.top + box.height - 14)
    },
  )

  it("reproduit les mesures de la maquette pour la classe B", () => {
    // GES B — 6 kg CO₂/m².an : encadré d'un seul bloc, aligné sur la rangée.
    const svg = generateGesSvg(6, "B")
    const box = calloutBox(svg)
    expect(box.height).toBe(199)
    expect(box.top).toBe(rowY("B").top)
  })

  it("n'embarque aucun lien ni copyright sortant", () => {
    const svg = generateGesSvg(35, "D")
    expect(svg).not.toContain("<a ")
    // Le seul « http » toléré est l'espace de noms SVG.
    const urls = [...svg.matchAll(/https?:\/\/[^"'\s<>]+/g)].map((m) => m[0])
    expect(urls).toEqual(["http://www.w3.org/2000/svg"])
  })
})

describe("aucune trace d'API externe dans les étiquettes générées", () => {
  it("ne mentionne jamais outils.immo, sur aucune classe", () => {
    for (const c of ENERGY_CLASSES as readonly EnergyClass[]) {
      expect(generateDpeSvg(180, c, 35, 90)).not.toContain("outils.immo")
      expect(generateGesSvg(35, c)).not.toContain("outils.immo")
    }
  })
})

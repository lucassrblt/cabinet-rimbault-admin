/**
 * Backfill des étiquettes DPE/GES — script one-shot.
 *
 * Régénère les étiquettes de tous les biens publiés disposant de données
 * énergétiques exploitables. Objectif : garantir qu'une étiquette SVG
 * conforme au modèle 2021 existe pour chaque bien affiché sur la vitrine,
 * puisque celle-ci n'a plus d'échelle HTML de secours.
 *
 * Effet de bord voulu : les anciennes étiquettes PNG issues de l'API
 * outils.immo sont écrasées via `upsertPropertyDocument`.
 *
 * Usage :
 *   npm run backfill:energy-labels              # applique
 *   npm run backfill:energy-labels -- --dry-run # liste sans rien écrire
 *
 * À lancer APRÈS le déploiement de l'admin et AVANT celui de la vitrine.
 */

import { autoGenerateEnergyLabels } from "../src/lib/energy-labels"
import { prisma } from "../src/lib/prisma"

const DRY_RUN = process.argv.includes("--dry-run")

async function main() {
  console.log(
    DRY_RUN
      ? "🔍 Backfill étiquettes énergie (dry-run, aucune écriture)"
      : "🏷️  Backfill étiquettes énergie",
  )

  const properties = await prisma.property.findMany({
    where: {
      isPublished: true,
      energy: {
        energyClass: { notIn: ["VIERGE"] },
        gesClass: { notIn: ["VIERGE"] },
        energyValue: { not: null },
        gesValue: { not: null },
      },
    },
    select: {
      id: true,
      reference: true,
      energy: {
        select: {
          energyValue: true,
          energyClass: true,
          gesValue: true,
          gesClass: true,
        },
      },
      documents: {
        where: { type: { in: ["DPE_IMAGE", "GES_IMAGE"] } },
        select: { type: true, mimeType: true },
      },
    },
    orderBy: { reference: "asc" },
  })

  console.log(`${properties.length} bien(s) publié(s) avec données énergie\n`)

  let regenerated = 0
  const failures: { reference: string; error: string }[] = []

  for (const property of properties) {
    const energy = property.energy
    // Filtré par la requête, mais Prisma ne peut pas le prouver au typage.
    if (
      !energy?.energyClass ||
      !energy.gesClass ||
      energy.energyValue == null ||
      energy.gesValue == null
    ) {
      continue
    }

    const legacy = property.documents.filter(
      (d) => d.mimeType && d.mimeType !== "image/svg+xml",
    )
    const missing = 2 - property.documents.length
    const context = [
      missing > 0 ? `${missing} étiquette(s) manquante(s)` : null,
      legacy.length > 0 ? `${legacy.length} PNG legacy` : null,
    ]
      .filter(Boolean)
      .join(", ")

    console.log(
      `→ ${property.reference} : DPE ${energy.energyClass} (${energy.energyValue}) / GES ${energy.gesClass} (${energy.gesValue})${context ? ` — ${context}` : ""}`,
    )

    if (DRY_RUN) continue

    const result = await autoGenerateEnergyLabels({
      propertyId: property.id,
      reference: property.reference,
      energyValue: energy.energyValue,
      energyClass: energy.energyClass,
      gesValue: energy.gesValue,
      gesClass: energy.gesClass,
    })

    if (result.success) {
      regenerated += 1
    } else {
      failures.push({
        reference: property.reference,
        error: result.error ?? "erreur inconnue",
      })
      console.error(`   ✗ ${property.reference} : ${result.error}`)
    }
  }

  // Contrôle final : biens publiés qui resteront sans étiquette DPE.
  const withoutLabel = await prisma.property.count({
    where: {
      isPublished: true,
      documents: { none: { type: "DPE_IMAGE" } },
    },
  })

  console.log("\n─────────────────────────────")
  if (!DRY_RUN) {
    console.log(`✅ ${regenerated} bien(s) régénéré(s)`)
    if (failures.length > 0) {
      console.log(`❌ ${failures.length} échec(s) :`)
      for (const f of failures) console.log(`   - ${f.reference} : ${f.error}`)
    }
  }
  console.log(
    `${withoutLabel === 0 ? "✅" : "⚠️ "} ${withoutLabel} bien(s) publié(s) sans DPE_IMAGE`,
  )
  if (withoutLabel > 0) {
    console.log(
      "   Ces biens sont en VIERGE ou sans données DPE : la vitrine masquera",
      "\n   leur section énergie (pas de cadre vide).",
    )
  }

  if (failures.length > 0) process.exitCode = 1
}

main()
  .catch((error) => {
    console.error("Backfill interrompu :", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

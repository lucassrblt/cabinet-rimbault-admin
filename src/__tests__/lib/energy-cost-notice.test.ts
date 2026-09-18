import { describe, it, expect } from 'vitest'

import {
  buildEnergyCostNotice,
  formatEnergyReferenceDate,
} from '@/lib/energy-cost-notice'

/**
 * Séparateur de milliers du français : espace fine insécable (U+202F), et non
 * une espace ordinaire. C'est ce que produit le formatage local, et c'est le
 * rendu typographique attendu.
 */
const NBSP = '\u202f'

describe('buildEnergyCostNotice', () => {
  it('compose la mention complète avec la formule imposée', () => {
    const notice = buildEnergyCostNotice({
      annualEnergyCostMin: 770,
      annualEnergyCostMax: 1090,
      referenceDate: '2021-01-01',
    })

    expect(notice).toBe(
      "Montant estimé des dépenses annuelles d'énergie pour un usage standard : " +
        `entre 770 € et 1${NBSP}090 € par an. ` +
        'Prix moyens des énergies indexés au 1er janvier 2021 (abonnements compris).'
    )
  })

  it('écrit « 1er » le premier du mois et le quantième sinon', () => {
    expect(formatEnergyReferenceDate('2021-01-01')).toBe('1er janvier 2021')
    expect(formatEnergyReferenceDate('2023-06-15')).toBe('15 juin 2023')
  })

  it('sépare les milliers à la française', () => {
    const notice = buildEnergyCostNotice({
      annualEnergyCostMin: 1200,
      annualEnergyCostMax: 12000,
      referenceDate: '2021-01-01',
    })

    expect(notice).toContain(`entre 1${NBSP}200 € et 12${NBSP}000 € par an`)
  })

  it("n'affiche rien si une borne de la fourchette manque", () => {
    expect(
      buildEnergyCostNotice({
        annualEnergyCostMin: 770,
        annualEnergyCostMax: null,
        referenceDate: '2021-01-01',
      })
    ).toBeNull()

    expect(
      buildEnergyCostNotice({
        annualEnergyCostMin: null,
        annualEnergyCostMax: 1090,
        referenceDate: '2021-01-01',
      })
    ).toBeNull()
  })

  it('omet la phrase sur les prix quand aucune date exploitable', () => {
    const sansDate = buildEnergyCostNotice({
      annualEnergyCostMin: 770,
      annualEnergyCostMax: 1090,
      referenceDate: null,
    })

    expect(sansDate).toBe(
      "Montant estimé des dépenses annuelles d'énergie pour un usage standard : " +
        `entre 770 € et 1${NBSP}090 € par an.`
    )

    const dateInvalide = buildEnergyCostNotice({
      annualEnergyCostMin: 770,
      annualEnergyCostMax: 1090,
      referenceDate: 'pas une date',
    })

    expect(dateInvalide).toBe(sansDate)
  })

  it('accepte aussi bien une chaîne ISO qu’un objet date', () => {
    const depuisChaine = buildEnergyCostNotice({
      annualEnergyCostMin: 200,
      annualEnergyCostMax: 600,
      referenceDate: '2026-09-18T00:00:00.000Z',
    })
    const depuisDate = buildEnergyCostNotice({
      annualEnergyCostMin: 200,
      annualEnergyCostMax: 600,
      referenceDate: new Date('2026-09-18T00:00:00.000Z'),
    })

    expect(depuisChaine).toBe(depuisDate)
    expect(depuisChaine).toContain('18 septembre 2026')
  })
})

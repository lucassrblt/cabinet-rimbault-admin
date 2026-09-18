import { describe, it, expect } from 'vitest'

import { propertyFormSchema } from '@/components/admin/property-form/schema'

/**
 * Les dépenses annuelles d'énergie doivent figurer sur toute annonce depuis le
 * 1er janvier 2022 (CCH, art. R126-23). Le formulaire les exige donc au même
 * titre que la consommation et les émissions.
 */
const validProperty = {
  title: 'Appartement lumineux',
  description: 'Un bien agréable en centre-ville avec beaucoup de lumière.',
  reference: 'AP-001',
  propertyType: 'APPARTEMENT',
  transactionType: 'VENTE',
  status: 'DISPONIBLE',
  price: 189000,
  city: 'Lyon',
  postalCode: '69001',
  address: '12 rue de la République',
  surface: 65,
  rooms: 3,
  bedrooms: 2,
  bathrooms: 1,
  energyClass: 'C',
  energyValue: 166,
  gesClass: 'D',
  gesValue: 25,
  annualEnergyCostMin: 770,
  annualEnergyCostMax: 1090,
  dateReferenceEnergie: '2021-01-01',
}

function failedPaths(input: unknown): string[] {
  const result = propertyFormSchema.safeParse(input)
  if (result.success) return []
  return result.error.issues.map((issue) => issue.path.join('.'))
}

describe('propertyFormSchema — dépenses annuelles d’énergie', () => {
  it('accepte un bien dont la fourchette et la date sont renseignées', () => {
    expect(propertyFormSchema.safeParse(validProperty).success).toBe(true)
  })

  it('refuse un bien sans montant minimum ni maximum', () => {
    const paths = failedPaths({
      ...validProperty,
      annualEnergyCostMin: undefined,
      annualEnergyCostMax: undefined,
    })

    expect(paths).toContain('annualEnergyCostMin')
    expect(paths).toContain('annualEnergyCostMax')
  })

  it("refuse un bien sans date d'indexation des prix de l'énergie", () => {
    expect(failedPaths({ ...validProperty, dateReferenceEnergie: '' })).toContain(
      'dateReferenceEnergie'
    )
  })

  it('refuse une date qui ne respecte pas le format attendu', () => {
    expect(
      failedPaths({ ...validProperty, dateReferenceEnergie: '01/01/2021' })
    ).toContain('dateReferenceEnergie')
  })

  it('refuse une fourchette dont le minimum dépasse le maximum', () => {
    const paths = failedPaths({
      ...validProperty,
      annualEnergyCostMin: 2000,
      annualEnergyCostMax: 1090,
    })

    expect(paths).toContain('annualEnergyCostMin')
  })

  it('refuse un montant négatif', () => {
    expect(failedPaths({ ...validProperty, annualEnergyCostMin: -10 })).toContain(
      'annualEnergyCostMin'
    )
  })
})

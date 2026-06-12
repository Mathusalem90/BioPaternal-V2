import { describe, it, expect } from 'vitest'
import { assessPaternity, MotherChildIncompatibilityError } from '../lib/bloodCalc'

describe('bloodCalc algorithm', () => {
  it('throws on impossible mother/child ABO pair', () => {
    expect(() =>
      assessPaternity(
        { abo: 'O', rh: '+', kell: 'K-' },
        { abo: 'A', rh: '+', kell: 'K+' },
        { abo: 'AB', rh: '+', kell: 'K-' }
      )
    ).toThrowError(MotherChildIncompatibilityError)
  })

  it('returns EXCLUSION when both parents are K- and child is K+', () => {
    const result = assessPaternity(
      { abo: 'A', rh: '+', kell: 'K-' },
      { abo: 'B', rh: '+', kell: 'K-' },
      { abo: 'AB', rh: '+', kell: 'K+' }
    )
    expect(result).toBe('EXCLUSION')
  })

  it('returns INCAPACITY_TO_EXCLUDE for biologically possible combination', () => {
    const result = assessPaternity(
      { abo: 'A', rh: '-', kell: 'K+' },
      { abo: 'B', rh: '+', kell: 'K+' },
      { abo: 'AB', rh: '+', kell: 'K+' }
    )
    expect(result).toBe('INCAPACITY_TO_EXCLUDE')
  })
})

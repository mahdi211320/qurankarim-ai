import { describe, it, expect } from 'vitest'
import { calculateSimilarity, formatPersianNumber } from '../src/lib/helpers.js'

describe('calculateSimilarity', () => {
  it('returns 100 for identical texts', () => {
    expect(calculateSimilarity('السلام علیکم', 'السلام علیکم')).toBe(100)
  })

  it('returns 100 for texts differing only in diacritics', () => {
    expect(calculateSimilarity('بِسْمِ اللَّهِ', 'بسم الله')).toBe(100)
  })

  it('returns a lower score for clearly different texts', () => {
    const score = calculateSimilarity('الحمد لله رب العالمین', 'قل هو الله احد')
    expect(score).toBeLessThan(50)
  })

  it('returns 0..100 range for partial overlap', () => {
    const score = calculateSimilarity('الرحمن الرحیم', 'الرحمن الکریم')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe('formatPersianNumber', () => {
  it('converts English digits to Persian digits', () => {
    expect(formatPersianNumber(1234)).toBe('۱۲۳۴')
  })

  it('leaves non-digit characters untouched', () => {
    expect(formatPersianNumber('درس 5')).toBe('درس ۵')
  })

  it('handles zero correctly', () => {
    expect(formatPersianNumber(0)).toBe('۰')
  })
})

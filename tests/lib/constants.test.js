import { describe, it, expect } from 'vitest'
import { SEVERITY_COLORS, SEVERITY_ORDER, SOURCE_EXTENSIONS } from '../../src/lib/constants.js'

describe('SEVERITY_COLORS', () => {
  it('has correct hex for Critical', () => {
    expect(SEVERITY_COLORS.Critical).toBe('#EF4444')
  })
  it('has all four severities', () => {
    expect(Object.keys(SEVERITY_COLORS)).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })
})

describe('SEVERITY_ORDER', () => {
  it('orders Critical before Low', () => {
    expect(SEVERITY_ORDER.indexOf('Critical')).toBeLessThan(SEVERITY_ORDER.indexOf('Low'))
  })
})

describe('SOURCE_EXTENSIONS', () => {
  it('includes .py', () => {
    expect(SOURCE_EXTENSIONS).toContain('.py')
  })
  it('includes .ts', () => {
    expect(SOURCE_EXTENSIONS).toContain('.ts')
  })
})

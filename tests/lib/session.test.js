import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../src/lib/session.js', async (importOriginal) => {
  const actual = await importOriginal()
  return actual
})

let localStorageMock = {}
beforeEach(() => {
  localStorageMock = {}
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(key => localStorageMock[key] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, val) => { localStorageMock[key] = val })
})

import { getOrCreateSessionId } from '../../src/lib/session.js'

describe('getOrCreateSessionId', () => {
  it('creates a new UUID when none stored', () => {
    const id = getOrCreateSessionId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('stores the generated ID in localStorage', () => {
    getOrCreateSessionId()
    expect(localStorageMock['vulnscan_session_id']).toBeDefined()
  })

  it('returns the same ID on subsequent calls', () => {
    const first = getOrCreateSessionId()
    const second = getOrCreateSessionId()
    expect(first).toBe(second)
  })
})

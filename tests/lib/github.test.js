import { describe, it, expect } from 'vitest'
import { parseGitHubUrl, filterSourceFiles } from '../../src/lib/github.js'

describe('parseGitHubUrl', () => {
  it('parses standard GitHub URL', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react')
    expect(result).toEqual({ owner: 'facebook', repo: 'react' })
  })

  it('parses URL with trailing slash', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react/')
    expect(result).toEqual({ owner: 'facebook', repo: 'react' })
  })

  it('returns null for invalid URL', () => {
    expect(parseGitHubUrl('https://gitlab.com/foo/bar')).toBeNull()
    expect(parseGitHubUrl('not-a-url')).toBeNull()
    expect(parseGitHubUrl('https://github.com/onlyone')).toBeNull()
  })
})

describe('filterSourceFiles', () => {
  const files = [
    { path: 'src/app.py', type: 'blob' },
    { path: 'src/index.js', type: 'blob' },
    { path: 'node_modules/lodash/lodash.js', type: 'blob' },
    { path: 'dist/bundle.min.js', type: 'blob' },
    { path: 'README.md', type: 'blob' },
    { path: 'src/utils.ts', type: 'blob' },
    { path: 'src/', type: 'tree' },
  ]

  it('includes source files', () => {
    const result = filterSourceFiles(files)
    expect(result.map(f => f.path)).toContain('src/app.py')
    expect(result.map(f => f.path)).toContain('src/index.js')
    expect(result.map(f => f.path)).toContain('src/utils.ts')
  })

  it('excludes node_modules', () => {
    const result = filterSourceFiles(files)
    expect(result.map(f => f.path)).not.toContain('node_modules/lodash/lodash.js')
  })

  it('excludes minified files', () => {
    const result = filterSourceFiles(files)
    expect(result.map(f => f.path)).not.toContain('dist/bundle.min.js')
  })

  it('excludes non-source extensions', () => {
    const result = filterSourceFiles(files)
    expect(result.map(f => f.path)).not.toContain('README.md')
  })

  it('excludes tree entries', () => {
    const result = filterSourceFiles(files)
    expect(result.every(f => f.type === 'blob')).toBe(true)
  })

  it('caps at 15 files', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ path: `src/file${i}.py`, type: 'blob' }))
    expect(filterSourceFiles(many).length).toBe(15)
  })
})

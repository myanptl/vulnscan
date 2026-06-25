import { SOURCE_EXTENSIONS, EXCLUDED_PATH_FRAGMENTS } from './constants.js'

export function parseGitHubUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.replace(/\/$/, '').split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

export function filterSourceFiles(files) {
  return files
    .filter(f => f.type === 'blob')
    .filter(f => SOURCE_EXTENSIONS.some(ext => f.path.endsWith(ext)))
    .filter(f => !EXCLUDED_PATH_FRAGMENTS.some(frag => f.path.includes(frag)))
    .slice(0, 15)
}

export async function fetchRepoFiles(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return filterSourceFiles(data.tree || [])
}

export async function fetchFileContent(owner, repo, path) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )
  if (!res.ok) throw new Error(`Cannot fetch ${path}: ${res.status}`)
  const data = await res.json()
  return atob(data.content.replace(/\n/g, ''))
}

export function buildMultiFileCode(files) {
  return files.map(({ path, content }) => `// === FILE: ${path} ===\n${content}`).join('\n\n')
}

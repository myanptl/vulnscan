import { useState, useEffect } from 'react'
import { fetchRepoFiles } from '../lib/github.js'

export default function FileSelector({ owner, repo, onFilesChange }) {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!owner || !repo) return
    setLoading(true)
    setError(null)
    fetchRepoFiles(owner, repo)
      .then(f => {
        setFiles(f)
        const allPaths = new Set(f.map(x => x.path))
        setSelected(allPaths)
        onFilesChange(f)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [owner, repo])

  function toggle(path) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      onFilesChange(files.filter(f => next.has(f.path)))
      return next
    })
  }

  if (loading) return <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-code)', fontSize: '0.8rem' }}>Fetching files…</p>
  if (error) return <p style={{ color: 'var(--color-critical)', fontSize: '0.85rem' }}>Error: {error}</p>
  if (!files.length) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
        {files.length} source files found (max 15) — uncheck to exclude
      </p>
      <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {files.map(f => (
          <label key={f.path} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-code)', color: selected.has(f.path) ? 'var(--color-text)' : 'var(--color-muted)' }}>
            <input
              type="checkbox"
              checked={selected.has(f.path)}
              onChange={() => toggle(f.path)}
              style={{ accentColor: 'var(--color-primary)', width: '14px', height: '14px' }}
            />
            {f.path}
          </label>
        ))}
      </div>
    </div>
  )
}

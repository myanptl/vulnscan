import { useState, useEffect, useRef } from 'react'
import { fetchRepoFiles } from '../lib/github.js'

export default function FileSelector({ owner, repo, onFilesChange }) {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Hold the latest onFilesChange so the fetch effect doesn't depend on the
  // prop's identity (parents commonly pass an inline callback, which would
  // otherwise re-trigger the fetch on every render).
  const onFilesChangeRef = useRef(onFilesChange)
  useEffect(() => {
    onFilesChangeRef.current = onFilesChange
  })

  useEffect(() => {
    if (!owner || !repo) return
    setLoading(true)
    setError(null)
    fetchRepoFiles(owner, repo)
      .then(allFiles => {
        const f = allFiles.slice(0, 15)
        setFiles(f)
        setSelected(new Set(f.map(x => x.path)))
        onFilesChangeRef.current(f)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [owner, repo])

  function toggle(path) {
    const next = new Set(selected)
    if (next.has(path)) {
      next.delete(path)
    } else {
      next.add(path)
    }
    setSelected(next)
    onFilesChangeRef.current(files.filter(f => next.has(f.path)))
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

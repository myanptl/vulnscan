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

  if (loading) return <div className="skeleton" style={{ width: '60%' }} />
  if (error) return <p className="error-text">Couldn’t list files: {error}</p>
  if (!files.length) return <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>No source files found in this repo.</p>

  return (
    <div className="field">
      <span>{selected.size} of {files.length} files selected</span>
      <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: 6 }}>
        {files.map(f => (
          <label key={f.path} className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', cursor: 'pointer', fontSize: 12.5, color: selected.has(f.path) ? 'var(--ink)' : 'var(--ink-3)' }}>
            <input
              type="checkbox"
              checked={selected.has(f.path)}
              onChange={() => toggle(f.path)}
              style={{ accentColor: 'var(--accent)', width: 14, height: 14, padding: 0 }}
            />
            {f.path}
          </label>
        ))}
      </div>
    </div>
  )
}

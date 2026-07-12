import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getOrCreateSessionId } from '../lib/session.js'
import { parseGitHubUrl, fetchFileContent, buildMultiFileCode } from '../lib/github.js'
import { LANGUAGE_OPTIONS } from '../lib/constants.js'
import ScanBeam from '../components/ScanBeam.jsx'
import ScanConsole from '../components/ScanConsole.jsx'
import FileSelector from '../components/FileSelector.jsx'

const card = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  padding: '1.5rem',
}

function Crosshair() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
      <circle cx="26" cy="26" r="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="26" cy="26" r="3.5" fill="currentColor" />
      <line x1="4"  y1="26" x2="13" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <line x1="39" y1="26" x2="48" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="4"  x2="26" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="39" x2="26" y2="48" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function ScanPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('code')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [repoInfo, setRepoInfo] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  function handleGithubUrlBlur() {
    const parsed = parseGitHubUrl(githubUrl)
    if (parsed) {
      setRepoInfo(parsed)
      setError(null)
    } else if (githubUrl.trim()) {
      setError('Invalid GitHub URL — expected: https://github.com/owner/repo')
      setRepoInfo(null)
    }
  }

  async function handleScan() {
    setError(null)
    setScanning(true)

    try {
      let codeToScan = ''
      let inputLabel = ''
      let inputType = mode

      if (mode === 'code') {
        if (!code.trim()) throw new Error('Paste some code to scan.')
        codeToScan = code.slice(0, 50000)
        inputLabel = 'Pasted Code'
      } else {
        if (!repoInfo) throw new Error('Enter a valid GitHub repo URL.')
        if (!selectedFiles.length) throw new Error('Select at least one file.')
        const results = await Promise.allSettled(
          selectedFiles.map(async f => ({
            path: f.path,
            content: await fetchFileContent(repoInfo.owner, repoInfo.repo, f.path),
          }))
        )
        const fileContents = results.filter(r => r.status === 'fulfilled').map(r => r.value)
        if (!fileContents.length) throw new Error('Could not fetch any files from this repository.')
        codeToScan = buildMultiFileCode(fileContents).slice(0, 50000)
        inputLabel = `${repoInfo.owner}/${repoInfo.repo}`
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ code: codeToScan, language, filename: inputLabel }),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')

      const findings = data.findings || []
      const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 }
      findings.forEach(f => { if (counts[f.severity] !== undefined) counts[f.severity]++ })

      const record = {
        session_id: getOrCreateSessionId(),
        input_type: inputType,
        input_label: inputLabel,
        language: language || 'unknown',
        code_snippet: codeToScan,
        findings,
        total_critical: counts.Critical,
        total_high: counts.High,
        total_medium: counts.Medium,
        total_low: counts.Low,
        scan_duration_ms: data.scan_duration_ms,
      }

      const { data: saved, error: dbErr } = await supabase.from('scans').insert(record).select().single()
      if (dbErr) throw dbErr

      navigate(`/results/${saved.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem 2.5rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
            }}>
              <span style={{ color: 'var(--color-accent)' }}>Vuln</span>Scan
            </h1>
            <span style={{
              fontSize: '0.6rem',
              fontFamily: 'var(--font-code)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              borderRadius: '2px',
              padding: '0.1rem 0.35rem',
              letterSpacing: '0.06em',
              opacity: 0.8,
            }}>
              v1
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-code)',
            fontSize: '0.7rem',
            color: 'var(--color-muted)',
            letterSpacing: '0.05em',
          }}>
            OWASP Top 10 · Static analysis · GitHub support
          </p>
        </div>
        <a
          href="/history"
          style={{
            fontFamily: 'var(--font-code)',
            fontSize: '0.72rem',
            color: 'var(--color-muted)',
            letterSpacing: '0.04em',
          }}
        >
          history →
        </a>
      </header>

      <div className="scan-grid" style={{ display: 'grid', gap: '1.25rem', flex: 1 }}>
        {/* Left — input */}
        <div style={card}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '0', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            {[
              { id: 'code', label: 'Code' },
              { id: 'github', label: 'GitHub' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  padding: '0.45rem 1rem',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  color: mode === id ? 'var(--color-accent)' : 'var(--color-muted)',
                  borderBottom: `2px solid ${mode === id ? 'var(--color-accent)' : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'color 0.12s, border-color 0.12s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'code' ? (
            <>
              <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
                <ScanBeam active={scanning} />
                <div style={{
                  padding: '0.5rem 0.75rem 0',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px 3px 0 0',
                  borderBottom: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.65rem', color: 'var(--color-muted)', letterSpacing: '0.04em' }}>
                    INPUT
                  </span>
                  {scanning && (
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.62rem',
                      color: 'var(--color-accent)',
                      animation: 'blink 1s step-end infinite',
                      letterSpacing: '0.05em',
                    }}>
                      SCANNING...
                    </span>
                  )}
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="// paste code here"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    height: '300px',
                    resize: 'vertical',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.78rem',
                    lineHeight: 1.65,
                    background: 'var(--color-surface)',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 3px 3px',
                    color: 'var(--color-text)',
                    display: 'block',
                  }}
                />
              </div>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <input
                type="url"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onBlur={handleGithubUrlBlur}
                placeholder="https://github.com/owner/repo"
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              {repoInfo && (
                <FileSelector
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  onFilesChange={setSelectedFiles}
                />
              )}
            </>
          )}

          {error && (
            <p style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.75rem',
              color: 'var(--color-critical)',
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}>
              ✕ {error}
            </p>
          )}

          <button
            className="vs-btn"
            onClick={handleScan}
            disabled={scanning}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '3px',
              background: scanning ? 'transparent' : 'var(--color-accent)',
              color: scanning ? 'var(--color-accent)' : '#08110A',
              border: `1px solid var(--color-accent)`,
              fontWeight: 700,
              fontSize: '0.82rem',
              fontFamily: 'var(--font-code)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'background 0.15s, color 0.15s',
              opacity: scanning ? 0.6 : 1,
            }}
          >
            {scanning ? '[ analyzing... ]' : '[ analyze ]'}
          </button>
        </div>

        {/* Right — live engine log while scanning, placeholder otherwise */}
        <div style={{
          ...card,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          {scanning ? (
            <ScanConsole />
          ) : (
            <>
          <div style={{ color: 'var(--color-muted)', opacity: 0.35 }}>
            <Crosshair />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '0.4rem',
            }}>
              Awaiting input
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', opacity: 0.6 }}>
              Findings will appear here after analysis
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            {['A01 Injection', 'A03 XSS', 'A07 Auth'].map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.62rem',
                color: 'var(--color-border)',
                letterSpacing: '0.04em',
              }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate('/results/demo')}
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.7rem',
              color: 'var(--color-accent)',
              letterSpacing: '0.04em',
              marginTop: '0.25rem',
            }}
          >
            view a demo report →
          </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
